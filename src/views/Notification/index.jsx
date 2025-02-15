import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Row, Col, Spinner, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from "../../assets/images/logo.svg";

const ITEMS_PER_PAGE = 15;

const notificationTypes = [
    { id: 'Prankster', label: 'English' },
    { id: 'प्रेंकस्टर', label: 'Hindi' }
];

const Notification = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Derived state
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    // API calls
    const getData = async () => {
        try {
            setLoading(true);
            const response = await axios.post('https://pslink.world/api/notification/read');
            const reversedData = response.data.data.reverse(); 
            setData(reversedData);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            const endpoint = id 
                ? `https://pslink.world/api/notification/update/${id}`
                : 'https://pslink.world/api/notification/create';
            const method = id ? 'patch' : 'post';
            
            const response = await axios[method](endpoint, {
                Title: selectedType,
                Description: description
            });

            toast.success(response.data.message);
            resetForm();
            getData();
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // UI handlers
    const resetForm = () => {
        setSelectedType('');
        setDescription('');
        setId(null);
        setErrors({});
        setVisible(false);
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
        setDescription(e.target.value);
        if (errors.description) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.description;
                return newErrors;
            });
        }
    };

    const handleEdit = (notification) => {
        if (!isSubmitting) {
            setSelectedType(notification.Title);
            setDescription(notification.Description);
            setId(notification._id);
            setVisible(true);
        }
    };

    const handleDelete = async (id) => {
        if (!isSubmitting && window.confirm("Are you sure you want to delete this Auto notification?")) {
            try {
                setIsSubmitting(true);
                const response = await axios.delete(`https://pslink.world/api/notification/delete/${id}`);
                toast.success(response.data.message);
                getData();
            } catch (err) {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Pagination
    const renderPaginationItems = () => {
        const items = [];
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
            <img src={logo} alt='loading....' style={{
                animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "200px"
            }} />
        </div>
    );

    return (
        <div>
            <div className="d-sm-flex justify-content-between align-items-center">
                <div>
                    <h4>Auto Notification</h4>
                </div>
            </div>

            <Button
                onClick={() => setVisible(true)}
                className="my-4 rounded-3 border-0"
                style={{ backgroundColor: "#F9E238" }}
                disabled={isSubmitting}
            >
                Add Auto Notification
            </Button>

            <Modal
                show={visible}
                onHide={() => !isSubmitting && resetForm()}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header>
                    <Modal.Title>{id ? "Edit Auto Notification" : "Add Auto Notification"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Notification Type
                                <span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span>
                            </Form.Label>
                            <div className="d-flex gap-3">
                                {notificationTypes.map((type) => (
                                    <button
                                        type="button"
                                        key={type.id}
                                        onClick={() => handleTypeSelect(type.id)}
                                        className={`cursor-pointer px-3 py-1 rounded-3 ${
                                            selectedType === type.id ? 'bg-primary' : 'bg-light'
                                        }`}
                                        style={{
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            border: `1px solid ${selectedType === type.id ? 'transparent' : '#dee2e6'}`
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                            {errors.type && (
                                <div className="mt-1 text-danger" style={{ fontSize: "12px" }}>{errors.type}</div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Auto Notification Description
                                <span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter description"
                                value={description}
                                onChange={handleDescriptionChange}
                                disabled={isSubmitting}
                                isInvalid={!!errors.description}
                            />
                            {errors.description && (
                                <div className="mt-1 text-danger" style={{ fontSize: "12px" }}>{errors.description}</div>
                            )}
                        </Form.Group>

                        <Row className="mt-4">
                            <Col xs={6}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={resetForm}
                                    disabled={isSubmitting}
                                    className="w-100 rounded-3 text-black"
                                    style={{ background: "#F6F7FB" }}
                                >
                                    Cancel
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button
                                    type="submit"
                                    className="submit border-0 rounded-3 w-100"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Spinner size="sm" /> : (id ? 'Update' : 'Submit')}
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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((notification, index) => (
                        <tr key={notification._id} className={index % 2 === 1 ? 'bg-light2' : 'bg-blue'}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td>{notification.Title}</td>
                            <td>{notification.Description}</td>
                            <td>
                                <Button
                                    className="edit-dlt-btn"
                                    style={{ color: "#0385C3" }}
                                    onClick={() => handleEdit(notification)}
                                    disabled={isSubmitting}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button
                                    className="edit-dlt-btn text-danger"
                                    onClick={() => handleDelete(notification._id)}
                                    disabled={isSubmitting}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <ToastContainer />

            {totalPages > 1 && (
                <div className="d-flex justify-content-center">
                    <Pagination>{renderPaginationItems()}</Pagination>
                </div>
            )}
        </div>
    );
};

export default Notification;