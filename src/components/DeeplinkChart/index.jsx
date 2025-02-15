// DeepLinkChart.js
import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const DeepLinkChart = ({ data }) => {
    const chartData = useMemo(() => {
        // Group data by source
        const sourceData = data.reduce((acc, item) => {
            if (!acc[item.sourceid]) {
                acc[item.sourceid] = { views: 0, installs: 0 };
            }
            acc[item.sourceid].views += item.view;
            acc[item.sourceid].installs += item.install;
            return acc;
        }, {});

        const sources = Object.keys(sourceData);
        const views = sources.map(source => sourceData[source].views);
        const installs = sources.map(source => sourceData[source].installs);

        return {
            labels: sources,
            datasets: [
                {
                    label: 'Views',
                    data: views,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.1
                },
                {
                    label: 'Installs',
                    data: installs,
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    tension: 0.1
                }
            ]
        };
    }, [data]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Source-wise Analytics',
                font: {
                    size: 20
                },
                padding: { 
                  bottom: 20, 
                }
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 0,
                    minRotation: 0
                }
            },
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div className="mb-4 bg-white p-4 rounded-4 shadow-sm">
            <div style={{ height: '400px' }}>
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
};

export default DeepLinkChart;