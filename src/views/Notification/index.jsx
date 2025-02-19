import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Row, Col, Spinner, Pagination, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    const currentItems = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

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
            <div className="d-sm-flex justify-content-between align-items-center">
                <div>
                    <h4>Auto Notification</h4>
                </div>
            </div>

            <div className='bg-white py-3 my-4' style={{ borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                <div className='d-flex flex-wrap justify-content-between align-items-center'>
                    <p className='fs-5 px-4'>Search Filters</p>
                </div>
                <div className='d-flex align-items-center justify-content-between px-4' style={{ borderTop: "1px solid #E4E6E8" }}>

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
                        Add Auto Notification
                    </Button>
                </div>


                <div className="table-responsive px-4 pt-4">
                    <Table bordered className='text-center fs-6 w-100 bg-white'>
                        <thead>
                            <tr>
                                <td className='py-4' style={{ fontWeight: "600" }}>Index</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Notification Title</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Notification Description</td>
                                <td className='py-4' style={{ fontWeight: "600" }}>Actions</td>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((notification, index) => (
                                <tr key={notification._id}>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td>{notification.Title}</td>
                                    <td>{notification.Description}</td>
                                    <td>
                                        <button
                                            className="edit-dlt-btn"
                                            style={{ color: "#0385C3" }}
                                            onClick={() => handleEdit(notification)}
                                            disabled={isSubmitting}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            className="edit-dlt-btn text-danger"
                                            onClick={() => handleDelete(notification._id)}
                                            disabled={isSubmitting}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
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
                                        className={`cursor-pointer px-3 py-1 rounded-3 ${selectedType === type.id ? 'bg-primary' : 'bg-light'
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

            <ToastContainer />
        </div>
    );
};

export default Notification;