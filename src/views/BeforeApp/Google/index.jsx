import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Modal, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar} from '@fortawesome/free-regular-svg-icons';
import { faDownload, faMousePointer } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Google = () => {
    const [filteredData, setFilteredData] = useState([]);
    const [since, setSince] = useState(new Date().toISOString().split('T')[0]);
    const [until, setUntil] = useState(new Date().toISOString().split('T')[0]);
    const [showDateModal, setShowDateModal] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState('today');
    const [isLoading, setIsLoading] = useState(false);

    console.log(filteredData);



    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://pslink.world/api/analytics/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ since, until })
            });
            const result = await response.json();
            setFilteredData(result.data || []);
            setShowDateModal(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        fetchData();
    };

    const calculateTotals = () => {
            return filteredData.reduce((acc, item) => {
                return {
                    click: acc.click + (parseFloat(item.click) || 0),
                    installs: acc.installs + (parseInt(item.installs) || 0)
                };
            }, {
                click: 0,
                installs: 0
            });
        };
    
        // Stats cards data
        const getStatsCards = () => {
            const totals = calculateTotals();
    
            return [
                {
                    title: 'Clicks',
                    value: totals.click,
                    icon: faMousePointer,
                    color: '#F89D36'
                },
                {
                    title: 'App Installs',
                    value: totals.installs,
                    icon: faDownload,
                    color: '#7E3A99'
                },
            ];
        };

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Google</h4>
                    <p className="text-muted">Analytics / dashboard</p>
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
                <Modal.Header >
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
                                            border: 'none', // Border remove karva mate
                                            outline: 'none', // Focus effect remove karva mate
                                            boxShadow: 'none' // Extra shadow remove karva mate
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

            {/* Data Table */}
            <div className="table-responsive mt-5">
                <table className="table table-striped table-bordered text-center">
                    <thead>
                        <tr className="text-center">
                            <th className='py-4'>Index</th>
                            <th>Campaign Name</th>
                            <th>Clicks</th>
                            <th>Install</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">No data found</td>
                            </tr>
                        ) : (
                            filteredData.map((item, index) => (
                                <tr key={item._id}>
                                    <td>{index + 1}</td>
                                    <td>{item.campaignName}</td>
                                    <td>{item.click}</td>
                                    <td>{item.installs}</td>
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

export default Google;