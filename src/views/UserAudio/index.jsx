import React, { useEffect, useState } from 'react';
import { Button, Table, Pagination, Form, Modal, Spinner, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';

// img
import logo from "../../assets/images/logo.svg";

const UserAudio = () => {
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [category, setCategory] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        categoryId: '',
        artistName: ''
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/users/read', { TypeId: "1" })
            .then((res) => {
                const newData = res.data.data.reverse();
                setFilteredData(newData);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };

    const getCategory = () => {
        axios.post('https://pslink.world/api/category/read')
            .then((res) => {
                setCategory(res.data.data);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch category.");
            });
    };

    useEffect(() => {
        getData();
        getCategory();
    }, []);

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedAudio(null);
        setFormData({ categoryId: '', artistName: '' });
    };

    const handleModalShow = (audio) => {
        setSelectedAudio(audio);
        setShowModal(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const errors = {};

        // Validate categoryId
        if (!formData.categoryId) {
            errors.categoryId = "Please select a category.";
        }
        setFormErrors(errors);

        // If validation fails, stop the submission
        if (Object.keys(errors).length > 0) {

            return;
        }

        setFormLoading(true); // Start the loader

        const submitFormData = new FormData();
        submitFormData.append('AudioName', selectedAudio.AudioName);
        submitFormData.append('Audio', selectedAudio.Audio);
        submitFormData.append('AudioPremium', false);
        submitFormData.append('Hide', false);
        submitFormData.append('role', selectedAudio._id);
        submitFormData.append('CategoryId', formData.categoryId);
        submitFormData.append('ArtistName', formData.artistName);

        if (window.confirm("Are you sure you want to move this Audio?")) {
            axios.post('https://pslink.world/api/audio/create', submitFormData)
                .then(() => {
                    getData();
                    toast.success('Audio Move Successfully');
                    handleModalClose();
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                })
                .finally(() => {
                    setFormLoading(false); // Stop the loader
                });
        } else {
            setFormLoading(false); // Stop the loader if canceled
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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

    const handleDelete = (audioId) => {
        if (window.confirm("Are you sure you want to delete this Audio?")) {
            axios.delete(`https://pslink.world/api/users/delete/${audioId}?TypeId=1`)
                .then((res) => {
                    getData();
                    toast.success(res.data.message);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                });
        }
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
                animation: "1.2s ease-out infinite zoom-in-zoom-out2",
                width: "200px"
            }} />
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center pb-5'>
                <div>
                    <h4>Audio </h4>
                    <p>User / Audio Management</p>
                </div>
            </div>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Audio Name</th>
                        <th>Audio</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((audio, index) => (
                            <tr key={audio._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{audio.AudioName}</td>
                                <td>
                                    <audio controls>
                                        <source src={audio.Audio} type="audio/mpeg" />
                                        <track
                                            kind="captions"
                                            src={audio.AudioName}
                                            srcLang="en"
                                            label="English"
                                            default
                                        />
                                        Your browser does not support the audio element.
                                    </audio>
                                </td>
                                <td>
                                    <Button
                                        className='bg-transparent border-0 fs-4'
                                        style={{ color: "#0385C3" }}
                                        onClick={() => handleModalShow(audio)}
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                    <Button
                                        className='bg-transparent border-0 text-danger fs-5'
                                        onClick={() => handleDelete(audio._id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center">No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal for category selection and artist name */}
            <Modal show={showModal} onHide={handleModalClose} centered>
                <Modal.Header>
                    <Modal.Title>Move Audio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        {/* Category Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Select Category<span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span></Form.Label>
                            <Form.Control
                                as="select"
                                value={formData.categoryId}
                                className='py-2'
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, categoryId: value });
                                    setFormErrors((prevErrors) => ({
                                        ...prevErrors,
                                        categoryId: value ? '' : prevErrors.categoryId, // Clear error if value exists
                                    }));
                                }}
                                isInvalid={!!formErrors.categoryId}
                            >
                                <option value="">Select a category</option>
                                {category.map((cat) => {
                                    if (cat.Type === 'audio') {
                                        return (
                                            <option key={cat._id} value={cat.CategoryId}>
                                                {cat.CategoryName}
                                            </option>
                                        );
                                    }
                                    return null;
                                })}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {formErrors.categoryId}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Artist Name Input */}
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Artist Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter artist name"
                                className='py-2'
                                value={formData.artistName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, artistName: value });
                                    setFormErrors((prevErrors) => ({
                                        ...prevErrors,
                                        artistName: value.trim() ? '' : prevErrors.artistName, // Clear error if value exists
                                    }));
                                }}
                                isInvalid={!!formErrors.artistName}
                            />
                        </Form.Group>

                        <Row className="mt-5">
                            <Col xs={6}>
                                <Button
                                    variant="secondary"
                                    onClick={handleModalClose}
                                    disabled={formLoading}
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
                                    disabled={formLoading}
                                >
                                    {formLoading ? <Spinner size='sm' /> : 'Submit'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>


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

export default UserAudio;