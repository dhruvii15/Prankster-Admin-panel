import React, { useEffect, useState } from 'react';
import { Button, Table, Pagination, Form, Modal, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';

// img
import logo from "../../assets/images/logo.svg";

const UserGallery = () => {
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [category, setCategory] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState(null);
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
        axios.post('https://pslink.world/api/users/read', { TypeId: "3" })
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
        setSelectedGallery(null);
        setFormData({ categoryId: '', artistName: '' });
        setFormErrors({});
    };

    const handleModalShow = (gallery) => {
        setSelectedGallery(gallery);
        setShowModal(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const errors = {};

        // Validate categoryId
        if (!formData.categoryId) {
            errors.categoryId = "Please select a category.";
        }

        // Validate artistName
        if (!formData.artistName.trim()) {
            errors.artistName = "Artist name is required.";
        }

        setFormErrors(errors);

        // If validation fails, stop the submission
        if (Object.keys(errors).length > 0) {
            return;
        }

        setFormLoading(true);

        const submitFormData = new FormData();
        submitFormData.append('GalleryName', selectedGallery.GalleryName);
        submitFormData.append('GalleryImage', selectedGallery.GalleryImage);
        submitFormData.append('GalleryPremium', false);
        submitFormData.append('Hide', false);
        submitFormData.append('role', selectedGallery._id);
        submitFormData.append('CategoryId', formData.categoryId);
        submitFormData.append('ArtistName', formData.artistName);

        if (window.confirm("Are you sure you want to move this Gallery Image?")) {
            axios.post('https://pslink.world/api/gallery/create', submitFormData)
                .then(() => {
                    getData();
                    toast.success('Gallery Image Moved Successfully');
                    handleModalClose();
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                })
                .finally(() => {
                    setFormLoading(false);
                });
        } else {
            setFormLoading(false);
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

    const handleDelete = (galleryId) => {
        if (window.confirm("Are you sure you want to delete this Gallery Image?")) {
            axios.delete(`https://pslink.world/api/users/delete/${galleryId}?TypeId=3`)
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
                    <h4>Gallery </h4>
                    <p>User / Gallery Management</p>
                </div>
            </div>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Gallery Name</th>
                        <th>Gallery Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((gallery, index) => (
                            <tr key={gallery._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{gallery.GalleryName}</td>
                                <td>
                                    <img src={gallery.GalleryImage} alt="gallery thumbnail" style={{ width: '100px', height: '100px' }} />
                                </td>
                                <td>
                                    <Button
                                        className='bg-transparent border-0 fs-4'
                                        style={{ color: "#0385C3" }}
                                        onClick={() => handleModalShow(gallery)}
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                    <Button 
                                        className='bg-transparent border-0 text-danger fs-5'
                                        onClick={() => handleDelete(gallery._id)}
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
                <Modal.Header closeButton>
                    <Modal.Title>Move Gallery Image</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        {/* Category Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Select Category</Form.Label>
                            <Form.Control
                                as="select"
                                value={formData.categoryId}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, categoryId: value });
                                    setFormErrors((prevErrors) => ({
                                        ...prevErrors,
                                        categoryId: value ? '' : prevErrors.categoryId,
                                    }));
                                }}
                                isInvalid={!!formErrors.categoryId}
                            >
                                <option value="">Select a category</option>
                                {category.map((cat) => {
                                    if (cat.Type === 'gallery') {
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
                                value={formData.artistName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, artistName: value });
                                    setFormErrors((prevErrors) => ({
                                        ...prevErrors,
                                        artistName: value.trim() ? '' : prevErrors.artistName,
                                    }));
                                }}
                                isInvalid={!!formErrors.artistName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.artistName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Submit Button */}
                        <Button type="submit" className='submit border-0' disabled={formLoading}>
                            {formLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" /> Submitting...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </Button>
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

export default UserGallery;