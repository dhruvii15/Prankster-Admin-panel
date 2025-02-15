import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, Col, Row,  Form, Button, Modal, Spinner } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { faChartLine, faDownload, faMousePointer, faRupeeSign } from '@fortawesome/free-solid-svg-icons';

// Registering Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Meta = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [since, setSince] = useState(new Date().toISOString().split('T')[0]);
    const [until, setUntil] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [showDateModal, setShowDateModal] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState('today');
    const [isLoading, setIsLoading] = useState(false);

    const CONFIG = {
        token: 'EAA3bad0IoxwBO4YZC9vWqhZBsEpizA5ZBZCWzNHEMh3GXC4Q5btCtRZBEq5RKuhYhgn6d4nnFnmaUNu1esYb2MwtXPQB4TY8zp3BslmpIGJ8JxnNhUQ7jjogZC580Ytr2OVNZBHMQAHP9Kx2r973tV7OwTt0ubhg4KoYpO3IzUohxn7kVZAXLeHoD5VR7AZBccZByvpmeM2zM2...',
        ad_account_id: 'act_1024664318506002',
        fb_app_id: '3900422423618332',
        fb_app_secret: '14d3b33c6acf2643ee5cf09b008a7bda'
    };


    const getData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('https://lolcards.link/api/analytics/facebook', {
                ...CONFIG,
                since,
                until
            });
            const fetchedData = response?.data?.data || [];
            // Filter data to only include campaigns with "prankster"
            const pranksterData = fetchedData.filter(item =>
                item.campaignName.toLowerCase().includes('prankster')
            );
            setData(pranksterData);
            setFilteredData(pranksterData);
            setShowDateModal(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data.");
        } finally {
            setIsLoading(false);
        }
    };


    const getDateRange = (preset) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        switch (preset) {
            case 'today':
                return { since: today.toISOString().split('T')[0], until: today.toISOString().split('T')[0] };
            case 'yesterday':
                return { since: yesterday.toISOString().split('T')[0], until: yesterday.toISOString().split('T')[0] };
            case 'thisWeek': {
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                return { since: startOfWeek.toISOString().split('T')[0], until: today.toISOString().split('T')[0] };
            }
            case 'lastWeek': {
                const endOfLastWeek = new Date(today);
                endOfLastWeek.setDate(today.getDate() - today.getDay() - 1);
                const startOfLastWeek = new Date(endOfLastWeek);
                startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
                return { since: startOfLastWeek.toISOString().split('T')[0], until: endOfLastWeek.toISOString().split('T')[0] };
            }
            case 'thisYear': {
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                return { since: startOfYear.toISOString().split('T')[0], until: today.toISOString().split('T')[0] };
            }
            case 'lastYear': {
                const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
                const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
                return { since: startOfLastYear.toISOString().split('T')[0], until: endOfLastYear.toISOString().split('T')[0] };
            }
            default:
                return { since, until };
        }
    };

    const handlePresetClick = (preset) => {
        setSelectedPreset(preset);
        if (preset !== 'custom') {
            const { since: newSince, until: newUntil } = getDateRange(preset);
            setSince(newSince);
            setUntil(newUntil);
        }
    };

    const handleDateChange = (type, value) => {
        if (type === 'since') {
            setSince(value);
        } else {
            setUntil(value);
        }
        setSelectedPreset('custom');
    };

    const handleApplyDates = () => {
        if (since > until) {
            toast.error("Start date cannot be after end date");
            return;
        }
        getData();
    };

    useEffect(() => {
        getData();
    }, []);

    const handleCampaignSelect = (event) => {
        const selectedCampaignName = event.target.value;
        setSelectedCampaign(selectedCampaignName);

        if (selectedCampaignName) {
            setFilteredData(data.filter(item => item.campaignName === selectedCampaignName));
        } else {
            setFilteredData(data);
        }
    };

    const uniqueCampaigns = [...new Set(data.map(item => item.campaignName))];

    const calculateTotals = () => {
        return filteredData.reduce((acc, item) => {
            return {
                totalSpend: acc.totalSpend + (parseFloat(item.spend) || 0),
                totalClicks: acc.totalClicks + (parseInt(item.clicks) || 0),
                totalInstalls: acc.totalInstalls + (parseInt(item.appInstalls) || 0),
                // Calculate average CPI only from items with valid CPI
                validCPICount: acc.validCPICount + (item.costPerInstall !== 'N/A' ? 1 : 0),
                totalCPI: acc.totalCPI + (item.costPerInstall !== 'N/A' ? parseFloat(item.costPerInstall) : 0)
            };
        }, {
            totalSpend: 0,
            totalClicks: 0,
            totalInstalls: 0,
            validCPICount: 0,
            totalCPI: 0
        });
    };

    // Stats cards data
    const getStatsCards = () => {
        const totals = calculateTotals();
        const avgCPI = totals.validCPICount > 0
            ? (totals.totalCPI / totals.validCPICount).toFixed(2)
            : 'N/A';

        return [
            {
                title: 'Ad Spend',
                value: `₹ ${totals.totalSpend.toFixed(2)}`,
                icon: faRupeeSign,
                color: '#43B0B8'
            },
            {
                title: 'Clicks',
                value: totals.totalClicks,
                icon: faMousePointer,
                color: '#F89D36'
            },
            {
                title: 'App Installs',
                value: totals.totalInstalls,
                icon: faDownload,
                color: '#7E3A99'
            },
            {
                title: 'Cost Per Install',
                value: avgCPI !== 'N/A' ? `₹${avgCPI}` : 'N/A',
                icon: faChartLine,
                color: '#47C054'
            }
        ];
    };


    return (
        <div>
            <div className="d-sm-flex justify-content-between align-items-center mb-3">
                <div>
                    <h4>Meta</h4>
                    <p>Analytics / dashboard</p>
                </div>
            </div>

            {/* Filter and Calendar section */}
            <div className="d-flex gap-3 flex-wrap w-100 align-items-center justify-content-between px-3">
                <div className='d-flex align-items-center justify-content-between'>
                    <Form.Select
                        aria-label="Select Campaign"
                        value={selectedCampaign}
                        onChange={handleCampaignSelect}
                        className="form-control bg-white"
                        style={{ fontSize: "13px" }}
                    >
                        <option value="">All Campaigns</option>
                        {uniqueCampaigns.map((campaign) => (
                            <option key={campaign} value={campaign}>{campaign}</option>
                        ))}
                    </Form.Select>
                </div>

                <Button
                    onClick={() => setShowDateModal(true)}
                    className="rounded-3 border-0 p-2 px-3"
                    style={{ background: "#F9E238" }}
                >
                    <FontAwesomeIcon icon={faCalendar} className="fs-5" />
                </Button>
            </div>

            {/* Date Selection Modal */}
            <Modal
                show={showDateModal}
                onHide={() => !isLoading && setShowDateModal(false)}
                size="lg"
                centered
            >
                <Modal.Header>
                    <Modal.Title>Select Date Range</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col xs={6}>
                            <div className="d-flex flex-column gap-2 mb-4 border-end px-3">
                                {['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisYear', 'lastYear', 'custom'].map((preset) => (
                                    <Button
                                        key={preset}
                                        variant="light"
                                        onClick={() => handlePresetClick(preset)}
                                        className="text-start"
                                        disabled={isLoading}
                                        style={{
                                            background: selectedPreset === preset ? '#F9E238' : 'transparent',
                                            transition: 'all 0.3s ease',
                                            border: 'none',
                                            outline: 'none',
                                            boxShadow: 'none'
                                        }}
                                    >
                                        {preset.charAt(0).toUpperCase() + preset.slice(1).replace(/([A-Z])/g, ' $1')}
                                    </Button>
                                ))}
                            </div>
                        </Col>
                        <Col xs={6} className={selectedPreset !== 'custom' ? 'opacity-50' : ''}>
                            <h5 className="mb-4">Custom Range</h5>
                            <div className="d-flex flex-column gap-3">
                                <div>
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={since}
                                        onChange={(e) => handleDateChange('since', e.target.value)}
                                        disabled={selectedPreset !== 'custom' || isLoading}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={until}
                                        onChange={(e) => handleDateChange('until', e.target.value)}
                                        disabled={selectedPreset !== 'custom' || isLoading}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="mt-4 w-25-cal ms-auto">
                        <Col xs={6}>
                            <Button
                                variant="secondary"
                                onClick={() => setShowDateModal(false)}
                                className='w-100 rounded-3 text-black'
                                style={{ background: "#F6F7FB" }}
                                disabled={isLoading}
                            >
                                Close
                            </Button>
                        </Col>
                        <Col xs={6}>
                            <Button
                                type="submit"
                                className='submit border-0 rounded-3 w-100 position-relative'
                                onClick={handleApplyDates}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                ) : (
                                    'Apply'
                                )}
                            </Button>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>


            <Row className="g-4 p-3 py-4">
                {getStatsCards().map((card, index) => (
                    <Col key={index} md={6} xl={3}>
                        <Card style={{ background: card.color }}>
                            <Card.Body className="text-white">
                                <h4 className="fs-6 fw-medium text-white">{card.title}</h4>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <FontAwesomeIcon icon={card.icon} className="fs-5" />
                                    <h4 className="mb-0 text-white">{card.value}</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>



            <div className="table-responsive mt-5">
                <table className="table table-striped table-bordered text-center">
                    <thead>
                        <tr className="text-center">
                            <th className='py-4'>Index</th>
                            <th>Campaign Name</th>
                            <th>Ad Name</th>
                            <th>Ad Id</th>
                            <th>Status</th>
                            <th>Impressions</th>
                            <th>Clicks</th>
                            <th>Spend</th>
                            <th>App Installs</th>
                            <th>Cost Per Install</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="10" className="text-center py-4">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center py-4">No data found</td>
                            </tr>
                        ) : (
                            filteredData.map((item, index) => (
                                <tr key={item._id}>
                                    <td>{index + 1}</td>
                                    <td>{item.campaignName}</td>
                                    <td>{item.adName}</td>
                                    <td>{item.adId}</td>
                                    <td>{item.status}</td>
                                    <td>{item.impressions}</td>
                                    <td>{item.clicks}</td>
                                    <td>₹{item.spend}</td>
                                    <td>{item.appInstalls}</td>
                                    <td>{item.costPerInstall !== 'N/A' ? `₹${item.costPerInstall}` : item.costPerInstall}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ToastContainer />
        </div>
    );
};

export default Meta;
