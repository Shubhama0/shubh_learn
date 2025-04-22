import React from 'react'
import  { useEffect, useRef, useState } from "react";



const Home = () => {

    const videoRef = useRef();
    const [watched, setWatched] = useState([]);
    const [watching, setWatching] = useState(new Set());
    const [intervalTimer, setIntervalTimer] = useState(null);
    const [alertShown, setAlertShown] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [videoSrc, setVideoSrc] = useState(null);
    const [videoKey, setVideoKey] = useState(null);
  
    useEffect(() => {
      if (!videoKey) return;
      const stored = JSON.parse(localStorage.getItem(videoKey));
      if (stored) {
        setWatched(stored.intervals || []);
        if (videoRef.current)
          videoRef.current.currentTime = stored.lastPosition || 0;
      } else {
        setWatched([]);
        if (videoRef.current) videoRef.current.currentTime = 0;
      }
    }, [videoKey]);





  
    const handleLoadedMetadata = () => {
      const duration = Math.floor(videoRef.current.duration);
      setVideoDuration(duration);
    };





  
    const startTracking = () => {
      const timer = setInterval(() => {
        const time = Math.floor(videoRef.current.currentTime);
        setWatching((prev) => new Set(prev).add(time));
      }, 500);
      setIntervalTimer(timer);
    };




  
    const stopTracking = () => {
      clearInterval(intervalTimer);
      const seconds = Array.from(watching).sort((a, b) => a - b);
      const merged = [];
      for (let i = 0; i < seconds.length; i++) {
        let start = seconds[i];
        while (i < seconds.length - 1 && seconds[i + 1] === seconds[i] + 1) i++;
        let end = seconds[i] + 1;
        merged.push([start, end]);
      }
      const all = mergeIntervals([...watched, ...merged]);
      const lastPosition = videoRef.current.currentTime;
      setWatched(all);
      setWatching(new Set());
      localStorage.setItem(
        videoKey,
        JSON.stringify({ intervals: all, lastPosition })
      );
  
      const progress = getProgressFromIntervals(all);
      if (progress === 100 && !alertShown) {
        alert("Great , You completed this video.");
        setAlertShown(true);
      }
    };






  
    const mergeIntervals = (intervals) => {
      intervals.sort((a, b) => a[0] - b[0]);
      const merged = [];
      for (const [start, end] of intervals) {
        if (!merged.length || merged[merged.length - 1][1] < start) {
          merged.push([start, end]);
        } else {
          merged[merged.length - 1][1] = Math.max(
            merged[merged.length - 1][1],
            end
          );
        }
      }
      return merged;
    };





  
    const getProgressFromIntervals = (intervals) => {
      if (videoDuration === 0) return 0;
      const uniqueSeconds = intervals.reduce((acc, [s, e]) => acc + (e - s), 0);
      return Math.min(((uniqueSeconds / videoDuration) * 100).toFixed(2), 100);
    };




  
    const handleReset = () => {
      if (!videoKey) return;
      localStorage.removeItem(videoKey);
      setWatched([]);
      setWatching(new Set());
      setAlertShown(false);
      if (videoRef.current) videoRef.current.currentTime = 0;
    };




  
    const getProgress = () => getProgressFromIntervals(watched);
  


    
    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const videoURL = URL.createObjectURL(file);
      const key = `video-progress-${file.name}`;
      setVideoSrc(videoURL);
      setVideoKey(key);
      setAlertShown(false);
    };
  





  return (
    <div>
     <main className="main-content">
        <div className="video-container">
        {!videoSrc && (
  <input type="file" accept="video/*" onChange={handleFileUpload} />
)}
          {videoSrc && (
            <>
              <video
                ref={videoRef}
                width="600"
                controls
                onPlay={startTracking}
                onPause={stopTracking}
                onEnded={stopTracking}
                onLoadedMetadata={handleLoadedMetadata}
                src={videoSrc}
              ></video>
              <div className="progress-row">

                <button className="reset-button" onClick={handleReset}>
                  Reset Progress
                </button>

                <div className="progress-display">
                  Progress: {getProgress()}%
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}




export default Home
