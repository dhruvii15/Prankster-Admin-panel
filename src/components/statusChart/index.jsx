import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatusChart = () => {

  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('https://pslink.world/api/admin/read')
      .then(response => {
        const statusData = response.data.data[0];
        setData(statusData);
      })
      .catch(error => {
        console.error("There was an error fetching the status data!", error);
      });
  }, []);


  return (
    <>
      
      <div className='-4 px-3'>
        <div className='border-bottom py-3 d-flex align-items-center justify-content-between'>
          <span>Ads Status</span>
          <div className='d-flex align-items-center'>
            <div className='border rounded-pill' style={{ width: "100px", height: "10px", background: data.AdsStatus ? "#70C06D" : "#E1E1E1", }}></div>
            <span className='ms-2 fw-bold'>{data.AdsStatus ? "On" : "Off"}</span>
          </div>
        </div>

        <div className='border-bottom py-3 d-flex align-items-center justify-content-between'>
          <span>Cover Safe Status</span>
          <div className='d-flex align-items-center'>
            <div className='border rounded-pill' style={{ width: "100px", height: "10px", background: data.CoverSafe ? "#F1AF4F" : "#E1E1E1", }}></div>
            <span className='ms-2 fw-bold'>{data.CoverSafe ? "On" : "Off"}</span>
          </div>
        </div>

        <div className='border-bottom py-3 d-flex align-items-center justify-content-between'>
          <span>Audio Safe Status</span>
          <div className='d-flex align-items-center'>
            <div className='border rounded-pill' style={{ width: "100px", height: "10px", background: data.AudioSafe ? "#D75450" : "#E1E1E1", }}></div>
            <span className='ms-2 fw-bold'>{data.AudioSafe ? "On" : "Off"}</span>
          </div>
        </div>

        <div className='border-bottom py-3 d-flex align-items-center justify-content-between'>
          <span>Video Safe Status</span>
          <div className='d-flex align-items-center'>
            <div className='border rounded-pill' style={{ width: "100px", height: "10px", background: data.VideoSafe ? "#448CC5" : "#E1E1E1", }}></div>
            <span className='ms-2 fw-bold'>{data.VideoSafe ? "On" : "Off"}</span>
          </div>
        </div>

        <div className='border-bottom py-3 d-flex align-items-center justify-content-between'>
          <span>Image Safe Status</span>
          <div className='d-flex align-items-center'>
            <div className='border rounded-pill' style={{ width: "100px", height: "10px", background: data.ImageSafe ? "#4D52B3" : "#E1E1E1", }}></div>
            <span className="ms-2 fw-bold">{data.ImageSafe ? "On" : "Off"}</span>
          </div>
        </div>


      </div>
    </>
  );
};

export default StatusChart;
