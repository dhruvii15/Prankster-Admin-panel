import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Row, Col, Spinner, Pagination } from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// img
import logo from "../../assets/images/logo.svg";

const PushNotification = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('');
    const [description, setdescription] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const notificationTypes = [
        { id: 'Prankster', label: 'English' },
        { id: 'प्रेंकस्टर', label: 'Hindi' }
    ];

    const toggleModal = (mode) => {
        if (!isSubmitting) {
            if (mode === 'add') {
                setSelectedType('');
                setdescription('');
                setId(undefined);
            }
            setErrors({});
            setVisible(!visible);
        }
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/notification/read', { type: 'push' })
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

    useEffect(() => {
        getData();
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!selectedType) newErrors.type = 'Please select a notification type';
        if (!description) newErrors.description = 'Notification Description is required';
        return newErrors;
    };

    const handleTypeSelect = (typeId) => {
        if (!isSubmitting) {
            setSelectedType(typeId);
            // Only clear the type error if it exists
            if (errors.type) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.type;
                    return newErrors;
                });
            }
        }
    };

    const handleDescriptionChange = (e) => {
        setdescription(e.target.value);
        // Only clear the description error if it exists
        if (errors.description) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.description;
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            const request = id !== undefined
                ? axios.patch(`https://pslink.world/api/notification/update/${id}`, { Title: selectedType, Description: description })
                : axios.post('https://pslink.world/api/notification/create', { Title: selectedType, Description: description, type: 'push' });

            const res = await request;
            setSelectedType('');
            setdescription('');
            getData();
            toast.success(res.data.message);
            toggleModal('add');
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Pagination logic
    const itemsPerPage = 15;
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: "hidden"
        }}>
            <img src={logo} alt='loading....' style={{
                animation: "1.2s ease-out infinite zoom-in-zoom-out2",
                width: "200px"
            }} />
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Push Notification</h4>
                </div>
            </div>

            <Button
                onClick={() => toggleModal('add')}
                className='my-4 rounded-3 border-0'
                style={{ backgroundColor: "#F9E238" }}
                disabled={isSubmitting}
            >
                Push Notification
            </Button>

            <Modal
                show={visible}
                onHide={() => !isSubmitting && toggleModal('add')}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header>
                    <Modal.Title>{id ? "Edit Push Notification" : "Push Notification"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>
                                Notification Type
                                <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>*</span>
                            </Form.Label>
                            <div className="d-flex gap-3">
                                {notificationTypes.map((type) => (
                                    <button
                                        type="button"
                                        key={type.id}
                                        onClick={() => handleTypeSelect(type.id)}
                                        className={`cursor-pointer px-3 py-1 rounded-3 ${selectedType === type.id ? 'bg-primary' : 'bg-light'
                                            }`}
                                        style={{
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            border: `1px solid ${selectedType === type.id ? '' : '#dee2e6'}`
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                            {errors.type && (
                                <div className="mt-1" style={{ color: "#e05866", fontSize: "12px" }}>{errors.type}</div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Push Notification Description
                                <span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                id="description"
                                className="py-2"
                                placeholder="Enter description"
                                value={description}
                                onChange={handleDescriptionChange}
                                isInvalid={!!errors.description}
                                disabled={isSubmitting}
                                rows={3}
                            />
                            {errors.description && (
                                <div className="mt-1" style={{ color: "#e05866", fontSize: "12px" }}>{errors.description}</div>
                            )}
                        </Form.Group>

                        <Row className="mt-4">
                            <Col xs={6}>
                                <Button
                                    type="button"
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

            <Table striped bordered hover responsive className="text-center fs-6">
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>Notification Title</th>
                        <th>Notification Description</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((notification, index) => (
                            <tr
                                key={notification._id}
                                className={index % 2 === 1 ? 'bg-light2' : 'bg-blue'}
                            >
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{notification.Title}</td>
                                <td>{notification.Description}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center">
                                No notifications to display.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {totalPages > 1 && (
                <div className='d-flex justify-content-center'>
                    <Pagination>
                        {renderPaginationItems()}
                    </Pagination>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default PushNotification;