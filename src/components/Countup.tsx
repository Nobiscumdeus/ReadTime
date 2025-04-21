import {useRef,useEffect,useState} from 'react';

interface CountUpProps {
    end: number;         // Final number to count up to
    duration?: number;   // Optional: total time (in milliseconds) for the count-up animation
    suffix?: string;     // Optional: text to appear after the number (e.g., '+', '%')
    prefix?: string;     // Optional: text to appear before the number (e.g., '$')
    decimals?: number;
}


const CountUp=({end,duration=2000,suffix='',prefix='', decimals = 0}:CountUpProps)=>{

    const [count,setCount]=useState(0);
    const countRef = useRef<HTMLSpanElement>(null); // Reference to the <span> element to observe when it's in view
    const observerRef = useRef<IntersectionObserver | null>(null); // Stores the IntersectionObserver instance


    useEffect(() => {
    //Creating Intersection observer to check when the element scrolls into view 
    const observer=new IntersectionObserver(
        (entries)=>{
            const [entry]=entries; //Destructure the first observed entry 
            if(entry.isIntersecting){ //Check if the entry is visible on the screen
                startCounting();
                observer.unobserve(entry.target) //Stop observing after triggering once 

            }
        },
        { threshold:0.1} //Trigger when 10% of the element is visible 
    );

    if(countRef.current){
        observer.observe(countRef.current) ; //Start observing the span element 
        observerRef.current=observer; //Store the observer instance for future clean up 
    }

    return ()=>{
        if(observerRef.current){
            observerRef.current.disconnect(); //Disconnect observer when component unmounts 
        }
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
},[]); //Run only once upon component mount


const startCounting=()=>{
    let start=0;
    const increment=end/(duration/16);
    // Calculate how much to increase each frame (assuming ~60 frames per second, so every 16ms)

    const timer=setInterval(()=>{
        start+=increment;
        if(start >= end ){
            setCount(end); // If we’ve reached the target, set it to exact end value
            clearInterval(timer); // Stop the animation
        }else{
            setCount(Math.ceil(start)); //Round up and update the count 
        }
    },16)  // Run the update every 16 milliseconds (approx. 60fps)
    return () => clearInterval(timer); // Ensure timer is cleared if needed
}

return(
    <span ref={countRef}>
         {prefix}
         {count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })} {/* Formats the number with commas (e.g., 1,000 instead of 1000) */}
      {suffix}
    </span>
)
}


export default CountUp