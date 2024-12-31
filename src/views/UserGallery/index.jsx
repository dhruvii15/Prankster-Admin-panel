import React, { useEffect, useState } from 'react';
import { Button, Table, Pagination, Form, Modal, Spinner, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faCheck, faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';

// img
import logo from "../../assets/images/logo.svg";
import ImagePreviewModal from 'components/ImagePreviewModal';

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
        galleryName: '',
        galleryPremium: false,
        hide: false
    });
    const [showPreview, setShowPreview] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

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

    const getAbsoluteIndex = (pageIndex) => {
        return indexOfFirstItem + pageIndex;
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedGallery(null);
        setFormData({
            categoryId: '',
            galleryName: '',
            galleryPremium: false,
            hide: false
        });
        setFormErrors({});
    };

    const handleModalShow = (gallery) => {
        setSelectedGallery(gallery);
        setFormData({
            categoryId: '',
            galleryName: gallery.GalleryName,
            galleryPremium: false,
            hide: false
        });
        setShowModal(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const errors = {};

        if (!formData.categoryId) {
            errors.categoryId = "Please select a Prank Category.";
        }
        if (!formData.galleryName.trim()) {
            errors.galleryName = "Gallery name is required.";
        }
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setFormLoading(true);

        const submitFormData = new FormData();
        submitFormData.append('GalleryName', formData.galleryName);
        submitFormData.append('GalleryImage', selectedGallery.GalleryImage);
        submitFormData.append('GalleryPremium', formData.galleryPremium);
        submitFormData.append('Hide', formData.hide);
        submitFormData.append('role', selectedGallery._id);
        submitFormData.append('CategoryId', formData.categoryId);

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

    const handleDownload = (imageUrl) => {
        fetch(imageUrl)
            .then((response) => response.blob()) // Convert the image to a Blob
            .then((blob) => {
                const url = window.URL.createObjectURL(blob); // Create an object URL
                const link = document.createElement('a');
                link.href = url;
                link.download = 'image-file.jpg'; // Set the default download filename
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url); // Release the URL object
            })
            .catch((error) => console.error('Download failed:', error));
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
                    <h4>Image </h4>
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
                                    <button
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => {
                                            setPreviewIndex(getAbsoluteIndex(index));
                                            setShowPreview(true);
                                        }}
                                    >
                                        <img
                                            src={gallery.GalleryImage || 'placeholder.jpg'}
                                            alt="gallery thumbnail"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                    </button>
                                </td>

                                <td>
                                    <Button
                                        className="edit-dlt-btn"
                                        onClick={() => handleDownload(gallery.GalleryImage)} // Pass your image URL here
                                    >
                                        <FontAwesomeIcon icon={faDownload} />
                                    </Button>
                                    <Button
                                        className='edit-dlt-btn'
                                        style={{ color: "#0385C3" }}
                                        onClick={() => handleModalShow(gallery)}
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                    <Button
                                        className='edit-dlt-btn text-danger'
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

            {/* Modal for category selection  */}
            <Modal show={showModal} onHide={handleModalClose} centered>
                <Modal.Header>
                    <Modal.Title>Move Gallery Image</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        {/* Gallery Name Input */}
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Gallery Name<span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter gallery name"
                                className='py-2'
                                value={formData.galleryName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, galleryName: value });
                                    setFormErrors((prevErrors) => ({
                                        ...prevErrors,
                                        galleryName: value.trim() ? '' : prevErrors.galleryName,
                                    }));
                                }}
                                isInvalid={!!formErrors.galleryName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formErrors.galleryName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Category Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Select Prank Category<span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span></Form.Label>
                            <Form.Control
                                as="select"
                                value={formData.categoryId}
                                className='py-2'
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
                                <option value="">Select a Prank Category</option>
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

                        <div className='d-flex flex-wrap gap-sm-4'>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="GalleryPremium"
                                    label="Premium Gallery Prank"
                                    checked={formData.galleryPremium}
                                    onChange={(e) => setFormData({ ...formData, galleryPremium: e.target.checked })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="Hide"
                                    label="Hide Gallery Prank"
                                    checked={formData.hide}
                                    onChange={(e) => setFormData({ ...formData, hide: e.target.checked })}
                                />
                            </Form.Group>
                        </div>

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

            <ImagePreviewModal
                show={showPreview}
                onHide={() => setShowPreview(false)}
                images={filteredData.map(item => item.GalleryImage)}
                currentIndex={previewIndex}
                onNavigate={(newIndex) => {
                    if (newIndex >= 0 && newIndex < filteredData.length) {
                        setPreviewIndex(newIndex);
                    }
                }}
            />
        </div>
    );
};

export default UserGallery;