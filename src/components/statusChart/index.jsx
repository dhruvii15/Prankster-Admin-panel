import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatusChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Call the API to get the status data
    axios.get('http://localhost:5001/api/admin/read')
      .then(response => {
        // Assuming the response is an array with a single object
        const statusData = response.data.data[0]; // Get the first item in the array
        console.log(statusData);

        // Map the feature statuses (CoverSafe, ImageSafe, AudioSafe, VideoSafe)
        const labels = ['Ad Status', 'Cover Safe Status', 'Audio Safe Status', 'Video Safe Status', 'Image Safe Status'];
        const dataValues = [
          statusData.AdsStatus,
          statusData.CoverSafe,
          statusData.AudioSafe,
          statusData.VideoSafe,
          statusData.ImageSafe
        ].map(status => (status ? 1 : 0)); // Convert true to 1, false to 0

        // Set the chart data
        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Feature Status',
              data: dataValues,
              backgroundColor: [
                "rgb(105,123,240)",
                "rgb(105,123,240)", // Cover
                "rgb(105,123,240)", // Audio
                "rgb(105,123,240)", // Video
                "rgb(105,123,240)", // Image
              ],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(error => {
        console.error("There was an error fetching the status data!", error);
      });
  }, []);

  // If data is still loading, show a loading state
  if (!chartData) {
    return <div>Loading...</div>;
  }

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    indexAxis: 'y', // Set horizontal bar chart
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: (value) => (value === 1 ? 'ON' : 'OFF'),
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <>
      <h5 className="mb-4">Prank Status</h5>
      <Bar data={chartData} options={barChartOptions} />
    </>
  );
};

export default StatusChart;
