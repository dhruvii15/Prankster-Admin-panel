import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Row, Col, Spinner, Pagination, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// img
import filter from "../../assets/images/filter.png"



const Ads = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [adsName, setAdsName] = useState('');
    const [adsId, setAdsId] = useState('');
    const [platform, setPlatform] = useState('');
    const [platformFilter, setPlatformFilter] = useState(''); // Add platform filter state
    const [errors, setErrors] = useState({});
    const [isOn, setIsOn] = useState(false);
    const [adminId, setAdminId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const platformTypes = [
        { id: 'ios', label: 'iOS' },
        { id: 'android', label: 'Android' }
    ];

    const toggleModal = (mode) => {
        if (!isSubmitting) {
            if (mode === 'add') {
                setAdsName('');
                setAdsId('');
                setPlatform('');
                setId(undefined);
            }
            setErrors({});
            setVisible(!visible);
        }
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/ads/read')
            .then((res) => {
                setData(res.data.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };

    const getAdminData = () => {
        axios.get('https://pslink.world/api/admin/read')
            .then((res) => {
                setIsOn(res.data.data[0].AdsStatus);
                setAdminId(res.data.data[0]._id);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch admin data.");
            });
    };

    useEffect(() => {
        getData();
        getAdminData();
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!adsName) newErrors.adsName = 'Ads Name is required';
        if (!adsId) newErrors.adsId = 'Ads ID is required';
        if (!platform) newErrors.platform = 'Platform is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            AdsName: adsName,
            Platform: platform,
            AdsId: adsId
        };

        try {
            setIsSubmitting(true);
            const request = id !== undefined
                ? axios.patch(`https://pslink.world/api/ads/update/${id}`, payload)
                : axios.post('https://pslink.world/api/ads/create', payload);

            const res = await request;
            setAdsName('');
            setAdsId('');
            setPlatform('');
            setId(undefined);
            getData();
            toast.success(res.data.message);
            toggleModal('add');
        } catch (err) {
            console.error(err);
            toast.error(err.response.data.message || "An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (ads) => {
        if (!isSubmitting) {
            setAdsName(ads.AdsName);
            setPlatform(ads.Platform);
            setAdsId(ads.AdsId);
            setId(ads._id);
            toggleModal('edit');
        }
    };

    const handleDelete = async (adsId) => {
        if (!isSubmitting && window.confirm("Are you sure you want to delete this ad?")) {
            try {
                setIsSubmitting(true);
                const res = await axios.delete(`https://pslink.world/api/ads/delete/${adsId}`);
                getData();
                toast.success(res.data.message);
            } catch (err) {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleToggle = async () => {
        if (!isSubmitting) {
            const newState = !isOn;
            try {
                setIsSubmitting(true);
                setIsOn(newState);

                if (adminId) {
                    const response = await axios.patch(`https://pslink.world/api/admin/update/${adminId}`, {
                        AdsStatus: newState
                    });
                    toast.success(response.data.message);
                    getAdminData();
                } else {
                    toast.error("Admin ID not available.");
                    setIsOn(!newState);
                }
            } catch (error) {
                console.error('Error updating AdsStatus:', error);
                toast.error("Failed to update AdsStatus.");
                setIsOn(!newState);
            } finally {
                setIsSubmitting(false);
            }
        }
    };


    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const itemsPerPageOptions = [10, 25, 50, 100];

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(value);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Calculate pagination values
    const totalItems = data.length;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Handle page changes
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Render pagination controls
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
                    onClick={() => paginate(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        return items;
    };

    if (loading) return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: "hidden"
            }}
        >
            <div className="dots-loader">
                <span></span><span></span><span></span>
            </div>
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Ads</h4>
                </div>


                <Form className='d-flex align-items-center gap-3'>
                    <span>Ads Status : </span>
                    <Form.Check
                        type="switch"
                        id="custom-switch"
                        checked={isOn}
                        onChange={handleToggle}
                        className="custom-switch-lg"
                        style={{ transform: 'scale(1.3)' }}
                        disabled={isSubmitting}
                    />
                </Form>
            </div>

            <div className='bg-white py-3 my-4 px-4' style={{ borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                <div className='d-flex flex-wrap justify-content-between align-items-center pb-2'>
                    <p className='fs-5'>Search Filters</p>
                    <div className='d-flex align-items-center justify-content-between py-2 flex-wrap'>
                        <div className='d-flex gap-2 align-items-center'>
                            <span className='mb-0 fw-bold fs-6'>Platform :</span>
                            <Dropdown>
                                <Dropdown.Toggle
                                    variant="light"
                                    id="platform-dropdown"
                                    className="bg-white border rounded-2 d-flex align-items-center justify-content-between"
                                    style={{ minWidth: "320px" }}
                                    bsPrefix="d-flex align-items-center justify-content-between"
                                >
                                    <div className="d-flex align-items-center">
                                        <img src={filter} alt="filter" width={18} className="me-2" />
                                        {platformFilter === '' ? 'All Platforms' : platformFilter}
                                    </div>
                                    <FontAwesomeIcon icon={faChevronDown} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="w-100 custom-dropdown-menu overflow-hidden" style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                                    <Dropdown.Item
                                        onClick={() => setPlatformFilter('')}
                                        active={platformFilter === ''}
                                        className="custom-dropdown-item"
                                    >
                                        <input type="checkbox" checked={platformFilter === ''} readOnly className="me-2" />
                                        All Platforms
                                    </Dropdown.Item>
                                    {platformTypes.map((type) => (
                                        <Dropdown.Item
                                            key={type.id}
                                            onClick={() => setPlatformFilter(type.id)}
                                            active={platformFilter === type.id}
                                            className="custom-dropdown-item mt-1"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={platformFilter === type.id}
                                                readOnly
                                                className="me-2"
                                            />
                                            {type.label}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
                <div className='d-flex align-items-center justify-content-between' style={{ borderBottom: "1px solid #E4E6E8" , borderTop: "1px solid #E4E6E8" }}>
                    <div className='d-flex align-items-center gap-2'>
                        <span>Show</span>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="light"
                                id="access-dropdown"
                                className="bg-white border rounded-2 d-flex align-items-center justify-content-between"
                                style={{ minWidth: "120px" }}
                                bsPrefix="d-flex align-items-center justify-content-between"
                            >
                                {itemsPerPage || 'Select Items Per Page'}
                                <FontAwesomeIcon icon={faChevronDown} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="w-100 custom-dropdown-menu overflow-hidden" style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                                {itemsPerPageOptions.map((option) => (
                                    <Dropdown.Item
                                        key={option}
                                        onClick={() => handleItemsPerPageChange(option)}
                                        active={itemsPerPage === option}
                                        className="custom-dropdown-item mt-1"
                                    >
                                        {option}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <Button
                        onClick={() => setVisible(true)}
                        className="my-3 rounded-3 border-0"
                        style={{ backgroundColor: "#F9E238", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}
                        disabled={isSubmitting}
                    >
                        Add New Ad
                    </Button>
                </div>


                <div className="table-responsive px-4">
                    <Table className='text-center fs-6 w-100 bg-white'>
                        <thead>
                            <tr>
                                <td className='py-4' style={{ fontWeight: "600" }}>Index</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>AdsName</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Platform</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Ads ID</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Actions</td>
                            </tr>
                        </thead>
                        <tbody>
                            {data
                                .filter(ads => !platformFilter || ads.Platform === platformFilter)
                                .map((ads, index) => (
                                    <tr key={ads._id} style={{ borderTop: "1px solid #E4E6E8" }}>
                                        <td>{index + 1}</td>
                                        <td>{ads.AdsName}</td>
                                        <td>{ads.Platform}</td>
                                        <td>{ads.AdsId}</td>
                                        <td>
                                            <Button
                                                className='edit-dlt-btn'
                                                style={{ color: "#0385C3" }}
                                                onClick={() => handleEdit(ads)}
                                                disabled={isSubmitting}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                            <Button
                                                className='edit-dlt-btn text-danger'
                                                onClick={() => handleDelete(ads._id)}
                                                disabled={isSubmitting}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </div>
                {totalPages > 1 && (
                    <div className='d-flex justify-content-between px-4 pt-1 align-items-center' style={{ borderTop: "1px solid #E4E6E8" }}>
                        <p className='m-0 fs-6' style={{ color: "#BFC3C7" }}>
                            Showing {startItem} to {endItem} of {totalItems} entries
                        </p>
                        <Pagination>
                            {renderPaginationItems()}
                        </Pagination>
                    </div>
                )}
            </div>

            <Modal
                show={visible}
                onHide={() => !isSubmitting && toggleModal('add')}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header>
                    <Modal.Title>{id ? "Edit Ads" : "Add New Ads"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Ads Name<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                as="select"
                                id="adsName"
                                value={adsName}
                                onChange={(e) => setAdsName(e.target.value)}
                                className="py-2 overflow-hidden"
                                isInvalid={!!errors.adsName}
                                disabled={isSubmitting}
                            >
                                <option value="" label="Select Ads Name" />
                                <option value="banner" label="Banner" />
                                <option value="nativesmall" label="Nativesmall" />
                                <option value="nativebig" label="Nativebig" />
                                <option value="intertitial" label="Intertitial" />
                                <option value="reward" label="Reward" />
                                <option value="appopen" label="App Open" />
                                <option value="appid" label="AppId" />
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {errors.adsName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>
                                Platform
                                <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>
                            </Form.Label>
                            <div className="d-flex gap-3">
                                {platformTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => !isSubmitting && setPlatform(type.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                !isSubmitting && setPlatform(type.id);
                                            }
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        className={`cursor-pointer px-3 py-1 rounded-3 ${platform === type.id ? 'bg-primary' : 'bg-light'}`}
                                        style={{
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            border: `1px solid ${platform === type.id ? '' : '#dee2e6'}`,
                                            userSelect: 'none'
                                        }}
                                    >
                                        {type.label}
                                    </div>

                                ))}
                            </div>
                            {errors.platform && (
                                <div className="text-danger mt-1 small">{errors.platform}</div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Ads ID<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="adsId"
                                className='py-2'
                                placeholder='Enter Ads ID'
                                value={adsId}
                                onChange={(e) => setAdsId(e.target.value)}
                                isInvalid={!!errors.adsId}
                                disabled={isSubmitting}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.adsId}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row className="mt-4">
                            <Col xs={6}>
                                <Button
                                    variant="secondary"
                                    onClick={() => toggleModal()}
                                    disabled={isSubmitting}
                                    className='w-100 rounded-3 text-black'
                                    style={{ background: "#F6F7FB" }}
                                >
                                    Cancel
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button
                                    type="submit"
                                    className='submit border-0 rounded-3 w-100'
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Spinner size='sm' /> : (id ? 'Update' : 'Submit')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>



            <ToastContainer />
        </div>
    );
};

export default Ads;