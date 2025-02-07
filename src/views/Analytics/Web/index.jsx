import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Modal, Pagination, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faFileAudio, faImage } from '@fortawesome/free-regular-svg-icons';
import { faArrowTrendDown, faArrowTrendUp, faShare, faVideo } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WebDashboard = () => {
    const [filteredData, setFilteredData] = useState([]);
    const [data, setData] = useState({ data: [], Audio: 0, Video: 0, Image: 0, Click: 0 });
    const [since, setSince] = useState(new Date().toISOString().split('T')[0]);
    const [until, setUntil] = useState(new Date().toISOString().split('T')[0]);
    const [showDateModal, setShowDateModal] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState('today');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [trendingFilter, setTrendingFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Reset filters function
    const resetFilters = () => {
        setTrendingFilter('');
        setTypeFilter('');
        setCurrentPage(1);
    };

    useEffect(() => {
        if (data?.data) {
            let filtered = [...data.data];

            if (trendingFilter) {
                filtered = filtered.filter(item =>
                    trendingFilter === 'trending' ? item.Trending : !item.Trending
                );
            }

            if (typeFilter) {
                filtered = filtered.filter(item =>
                    item.Type.toLowerCase() === typeFilter.toLowerCase()
                );
            }

            setFilteredData(filtered);
            setCurrentPage(1);
        }
    }, [data, trendingFilter, typeFilter]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://pslink.world/api/analytics/web', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ since, until })
            });
            const result = await response.json();
            setData(result);
            setFilteredData(result.data || []);
            setShowDateModal(false);
            // Reset filters when new data is fetched
            resetFilters();
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

    // Pagination configuration
    const itemsPerPage = 15;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const renderPaginationItems = () => {
        let items = [];
        const totalPagesToShow = 4;
        let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);

        if (endPage - startPage < totalPagesToShow - 1) {
            startPage = Math.max(1, endPage - totalPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }
        return items;
    };

    const statCards = [
        { title: 'Audio Prank View', value: data.Audio, icon: faFileAudio, color: '#43B0B8' },
        { title: 'Video Prank View', value: data.Video, icon: faVideo, color: '#F89D36' },
        { title: 'Image Prank View', value: data.Image, icon: faImage, color: '#7E3A99' },
        { title: 'App Redirect', value: data.Click, icon: faShare, color: '#47C054' }
    ];

    return (
        <div className="p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0">Website</h4>
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

            {/* Stat Cards */}
            <Row className="g-4 mb-4">
                {statCards.map((card, index) => (
                    <Col key={index} md={6} xl={3}>
                        <Card style={{ background: card.color }}>
                            <Card.Body className="text-white">
                                <h4 className="fs-6 fw-medium text-white">{card.title}</h4>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <FontAwesomeIcon icon={card.icon} className="fs-5" />
                                    <h4 className="mb-0 text-white">{card.value || 0}</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>



            {/* Filters */}
            <div className="d-flex gap-4 justify-content-end mb-4 pt-5">
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold">Trending:</span>
                    <select
                        className="form-select bg-white"
                        value={trendingFilter}
                        onChange={(e) => setTrendingFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="trending">Trending</option>
                        <option value="non-trending">Non-Trending</option>
                    </select>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold">Type:</span>
                    <select
                        className="form-select bg-white"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="audio">Audio</option>
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                    </select>
                </div>
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

            {/* Data Table */}
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead>
                        <tr className="text-center">
                            <th>Index</th>
                            <th>Link</th>
                            <th>Trending</th>
                            <th>Type</th>
                            <th>Cover Image</th>
                            <th>File</th>
                            <th>Views</th>
                            <th>App Redirect</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </td>
                            </tr>
                        ) : currentItems.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">No data found</td>
                            </tr>
                        ) : (
                            currentItems.map((item, index) => (
                                <tr key={item._id}>
                                    <td className="text-center">{indexOfFirstItem + index + 1}</td>
                                    <td style={{
                                        minWidth: "150px", // Prevents shrinking on small screens
                                        width: "150px",    // Keeps it fixed on larger screens
                                        maxWidth: "150px", // Ensures it doesn't grow beyond 150px
                                        wordBreak: "break-word",
                                        overflowWrap: "break-word",
                                        whiteSpace: "normal"
                                    }}>
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-decoration-none text-black"
                                            style={{ display: "block", wordBreak: "break-word" }}
                                        >
                                            {item.url}
                                        </a>
                                    </td>

                                    <td className="text-center">
                                        <FontAwesomeIcon
                                            icon={item.Trending ? faArrowTrendUp : faArrowTrendDown}
                                            title={item.Trending ? "up" : "down"}
                                            className='fs-5'
                                            style={{ color: item.Trending ? 'green' : 'red' }}
                                        />
                                    </td>
                                    <td className="text-center">{item.Type}</td>
                                    <td className='text-center'>
                                        <img
                                            src={item.CoverImage}
                                            alt="Cover"
                                            style={{ width: '100px', height: '100px' }}
                                        />
                                    </td><td className="text-center">
                                        {item.Type === "video" ? (
                                            <video controls width="100" height="100">
                                                <source src={item.File} type="video/mp4" />
                                                <track
                                                    kind="captions"
                                                    src={item.Type}
                                                    srcLang="en"
                                                    label="English"
                                                    default
                                                />
                                                Your browser does not support the video element.
                                            </video>
                                        ) : item.Type === "audio" ? (
                                            <audio controls>
                                                <source src={item.File} type="audio/mpeg" />
                                                <track
                                                    kind="captions"
                                                    src={item.Type}
                                                    srcLang="en"
                                                    label="English"
                                                    default
                                                />
                                                Your browser does not support the audio element.
                                            </audio>
                                        ) : (
                                            <img
                                                src={item.File}
                                                alt="File"
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                        )}
                                    </td>
                                    <td className="text-center">{item.Views}</td>
                                    <td className="text-center">{item.Installs}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className='d-flex justify-content-center'>
                    <Pagination>
                        {renderPaginationItems()}
                    </Pagination>
                </div>
            )}

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default WebDashboard;