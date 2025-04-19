from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.linear_model import LinearRegression
import uvicorn
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = FastAPI(title="Reading Tracker AI API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Allow frontend origin
    #allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




class ReadingData(BaseModel):
    date: datetime  # FastAPI will auto-convert ISO strings
    hours: float

class ReadingDataList(BaseModel):
    readings: List[ReadingData]

class InsightsResponse(BaseModel):
    insights: List[dict]



# AI insights endpoint
@app.post('/ai/analyze', response_model=InsightsResponse)
async def analyze_reading_data(data: ReadingDataList):
    """Analyze reading data and provide AI-powered insights"""
    print("\n=== Received request ===")
    print("First reading item:", data.readings[0] if data.readings else "Empty")
    
    if len(data.readings) < 3:
        print("Insufficient data")

        #return {"insights": ["Not enough data for meaningful analysis. Please log at least 3 days of reading."]}
        return {
            "insights": [{
                "type": "error",
                "title": "Insufficient Data",
                "message": "Not enough data for meaningful analysis. Please log at least 3 days of reading.",
                "score": 0
            }]
        }
    


    # Convert to DataFrame for easier analysis
    '''
       df = pd.DataFrame([{
        "date": datetime.fromisoformat(item.date.split('T')[0]),
        "hours": item.hours
    } for item in data.readings])

    '''
    try:
        df = pd.DataFrame([{
                "date": pd.to_datetime(item.date),  # Better parsing
                "hours": item.hours
            } for item in data.readings])
            
        print("\nDataFrame created:")
        print(df.head())
            
    
        # Sort by date
        df = df.sort_values("date")
        df["day_of_week"] = df["date"].dt.day_name()
        df["day_num"] = df["date"].dt.dayofweek  # 0=Monday, 6=Sunday

        insights = []

        # Consistency analysis
        days_in_period = (df["date"].max() - df["date"].min()).days + 1
        consistency_score = len(df) / days_in_period if days_in_period > 0 else 0

        if consistency_score < 0.3:
            insights.append({
                "type": "consistency",
                "title": "Reading Consistency",
                "message": "Your reading schedule is inconsistent. Try to establish a daily reading habit even if it's just for 15-20 minutes.",
                "score": round(consistency_score * 100)
            })
        elif consistency_score > 0.7:
            insights.append({
                "type": "consistency",
                "title": "Excellent Consistency",
                "message": "Great job maintaining a consistent reading schedule! Consistency is key to making progress.",
                "score": round(consistency_score * 100)
            })

        # Trend analysis
        if len(df) >= 5:
            df["day_index"] = range(len(df))
            X = df[["day_index"]]
            y = df["hours"]
            model = LinearRegression().fit(X, y)
            slope = model.coef_[0]

            if slope > 0.1:
                insights.append({
                    "type": "trend",
                    "title": "Positive Trend",
                    "message": "Your reading time is steadily increasing. Keep up the good momentum!",
                    "score": round(slope * 10, 1)
                })
            elif slope < -0.1:
                insights.append({
                    "type": "trend",
                    "title": "Declining Trend",
                    "message": "Your reading time has been decreasing. Consider setting aside dedicated reading time.",
                    "score": round(slope * 10, 1)
                })

        # Optimal day analysis
        if len(df) >= 7:
            day_averages = df.groupby("day_of_week")["hours"].mean().sort_values(ascending=False)
            top_day = day_averages.index[0]
            top_day_avg = day_averages.iloc[0]

            insights.append({
                "type": "pattern",
                "title": "Best Reading Day",
                "message": f"{top_day} appears to be your most productive reading day, averaging {round(top_day_avg, 1)} hours.",
                "score": round(top_day_avg, 1)
            })

        # Reading streak analysis
        df["date_ordinal"] = df["date"].apply(lambda x: x.toordinal())
        df = df.sort_values("date_ordinal")
        current_streak = 1
        max_streak = 1

        for i in range(1, len(df)):
            if df.iloc[i]["date_ordinal"] - df.iloc[i - 1]["date_ordinal"] == 1:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 1

        if max_streak >= 3:
            insights.append({
                "type": "streak",
                "title": "Reading Streak",
                "message": f"Your longest reading streak is {max_streak} consecutive days. Try to maintain or beat this streak!",
                "score": max_streak
            })

        # Personalized recommendation
        avg_session = df["hours"].mean()
        recommendation = ""

        if avg_session < 0.5:
            recommendation = "Your reading sessions are short. Consider techniques like the Pomodoro method to gradually increase your reading time."
        elif 0.5 <= avg_session < 1:
            recommendation = "You're averaging less than an hour per session. Try to find a distraction-free environment to extend your reading sessions."
        elif 1 <= avg_session < 2:
            recommendation = "You have a good reading rhythm. Consider setting specific reading goals for each session to maintain motivation."
        else:
            recommendation = "Your reading sessions are substantial. Make sure to take short breaks to maintain focus during these longer sessions."

        insights.append({
            "type": "recommendation",
            "title": "Session Optimization",
            "message": recommendation,
            "score": round(avg_session, 1)
        })
        print("\nGenerated insights:")
        for i, insight in enumerate(insights):
            print(f"{i+1}. {insight['type']}: {insight['message']}")

        return {"insights": insights}
    
    except Exception as e:
        print("\n!!! Analysis error !!!")
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))





#@app.get("/ai/predict-goal/{user_id}")





class PredictionRequest(BaseModel):
    target_hours: Optional[float] = None
    month_data: List[Dict[str, float | str]]  # Ensure this matches your data structure


@app.post("/ai/predict-goal")
async def predict_monthly_goal(
   # target_hours: Optional[float] = None, 
    #month_data: Optional[List[Dict]] = None
    request:PredictionRequest
):
    """Predict whether the user will reach their monthly reading goal"""
    month_data=request.month_data
    target_hours=request.target_hours
    try:
        # Validate input data
        if not month_data or len(month_data) == 0:
            return {
                "error": "Not enough data",
                "message": "No reading data available for this month."
            }

        # Convert provided data to DataFrame
        df = pd.DataFrame(month_data)
        df["date"] = pd.to_datetime(df["date"])

        # Get current date information
        now = datetime.now()
        current_year = now.year
        current_month = now.month

        # Calculate current progress
        total_hours = df["hours"].sum()
        days_passed = now.day

        # Calculate days in current month
        if current_month == 12:
            next_month = datetime(current_year + 1, 1, 1)
        else:
            next_month = datetime(current_year, current_month + 1, 1)
        
        days_in_month = (next_month - datetime(current_year, current_month, 1)).days
        days_remaining = days_in_month - days_passed

        # Calculate reading statistics
        reading_days = len(df)
        if reading_days == 0:
            return {
                "error": "Not enough data",
                "message": "No reading data available for this month. Please log some reading sessions."
            }

        daily_rate = total_hours / reading_days
        days_read_per_week = reading_days / (days_passed / 7)
        expected_remaining_sessions = (days_remaining / 7) * days_read_per_week
        projected_additional_hours = expected_remaining_sessions * daily_rate
        projected_total = total_hours + projected_additional_hours

        # Prepare base result
        result = {
            "current_hours": round(total_hours, 1),
            "projected_total": round(projected_total, 1),
            "average_session": round(daily_rate, 1),
            "reading_frequency": f"{round(days_read_per_week, 1)} days per week"
        }

        # Add goal prediction if target hours provided
        if target_hours:
            target_hours = float(target_hours)
            target_likelihood = min(100, max(0, (projected_total / target_hours) * 100))
            
            result.update({
                "target_hours": target_hours,
                "target_likelihood": round(target_likelihood)
            })

            # Generate recommendation based on likelihood
            if target_likelihood >= 90:
                result["recommendation"] = "You're on track to exceed your goal. Consider increasing your target!"
            elif target_likelihood >= 70:
                result["recommendation"] = "You're likely to reach your goal if you maintain your current pace."
            else:
                required_daily = (target_hours - total_hours) / days_remaining if days_remaining > 0 else 0
                
                # Add a max cap for reasonable daily reading hours (adjust as needed)
                MAX_DAILY_READING_HOURS = 10 #may also be 24 hrs though if we allow 

                if required_daily > MAX_DAILY_READING_HOURS:
                    # Goal is unrealistic given the time remaining
                    max_possible_hours = total_hours + (days_remaining * MAX_DAILY_READING_HOURS)
                    percentage_possible = min(100, max(0, (max_possible_hours / target_hours) * 100))
                    
                    result["recommendation"] = (
                        f"Your goal requires {round(required_daily, 1)} hours daily, which exceeds realistic reading time. "
                        f"Even reading {MAX_DAILY_READING_HOURS} hours daily would achieve approximately {round(percentage_possible)}% "
                        f"of your goal ({round(max_possible_hours, 1)} of {target_hours} hours). Consider adjusting your target."
                    )
                
                else:
                    # Goal is challenging but achievable
                    result["recommendation"] = f"To reach your goal, try to read {round(required_daily, 1)} hours every day for the rest of the month."

                
        return result

    except Exception as e:
        print(f"Error in predict_monthly_goal: {e}")
        raise HTTPException(status_code=500, detail=str(e))





# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    uvicorn.run("home:app", host="0.0.0.0", port=8000, reload=True)