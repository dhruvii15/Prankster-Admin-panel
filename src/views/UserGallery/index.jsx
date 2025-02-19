import React, { useEffect, useState } from 'react';
import { Table, Pagination, Form, Modal, Spinner, Row, Col, Dropdown, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faCheck, faChevronDown, faDownload, faTrash } from '@fortawesome/free-solid-svg-icons';

// img
import ImagePreviewModal from 'components/ImagePreviewModal';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import TruncatedText from 'components/TruncatedText';

const UserGallery = () => {
    const category = [
        { CategoryId: 1, CategoryName: 'Trending' },
        { CategoryId: 2, CategoryName: 'Nonveg' },
        { CategoryId: 3, CategoryName: 'Hot' },
        { CategoryId: 4, CategoryName: 'Funny' },
        { CategoryId: 5, CategoryName: 'Horror' },
        { CategoryId: 6, CategoryName: 'Celebrity' }
    ];

    const language = [
        { LanguageId: 1, LanguageName: 'Hindi' },
        { LanguageId: 2, LanguageName: 'English' },
        { LanguageId: 3, LanguageName: 'Marathi' },
        { LanguageId: 4, LanguageName: 'Gujarati' },
        { LanguageId: 5, LanguageName: 'Tamil' },
        { LanguageId: 6, LanguageName: 'Punjabi' }
    ];

    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        categoryId: '',
        languageId: '',
        galleryName: '',
        galleryPremium: false,
        safe: false,
        hide: false
    });
    const [showPreview, setShowPreview] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

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


    useEffect(() => {
        getData();
    }, []);

    const getAbsoluteIndex = (pageIndex) => {
        return indexOfFirstItem + pageIndex;
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedGallery(null);
        setFormData({
            categoryId: '',
            languageId: '',
            galleryName: '',
            galleryPremium: false,
            safe: false,
            hide: false
        });
        setFormErrors({});
    };

    const handleModalShow = (gallery) => {
        setSelectedGallery(gallery);
        setFormData({
            categoryId: '',
            languageId: '',
            galleryName: gallery.GalleryName,
            galleryPremium: false,
            safe: false,
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
        if (!formData.languageId) {
            errors.languageId = "Please select a Prank Language.";
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
        submitFormData.append('Safe', formData.safe);
        submitFormData.append('role', selectedGallery._id);
        submitFormData.append('Hide', formData.safe);
        submitFormData.append('CategoryId', formData.categoryId);
        submitFormData.append('LanguageId', formData.languageId);


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

    const handleCopyToClipboard = (gallery) => {
        if (gallery) {
            navigator.clipboard.writeText(gallery)
                .then(() => {
                    toast.success("Image URL copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy: ", error);
                });
        } else {
            alert("No URL to copy!");
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
    const totalItems = filteredData.length;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
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
            <div className="dots-loader">
                <span></span><span></span><span></span>
            </div>
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center pb-5'>
                <div>
                    <h4>Image </h4>
                </div>
            </div>

            <div className='bg-white py-3' style={{ borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
                <div className='d-flex flex-wrap justify-content-between align-items-center'>
                    <p className='fs-5 px-4'>Search Filters</p>
                    <div className='d-flex align-items-center gap-2 p-4'>
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
                </div>

                <div className="table-responsive px-4">
                    <Table bordered className='text-center fs-6 w-100 bg-white'>
                        <thead>
                            <tr>
                                <TruncatedText text={'Id'} />
                                <TruncatedText text={'Gallery Name'} />
                                <TruncatedText text={'Gallery Image'} />
                                <TruncatedText text={'Actions'} />
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems && currentItems.length > 0 ? (
                                currentItems.map((gallery, index) => (
                                    <tr key={gallery._id}>
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
                                            <button
                                                className="edit-dlt-btn"
                                                onClick={() => handleDownload(gallery.GalleryImage)} // Pass your image URL here
                                            >
                                                <FontAwesomeIcon icon={faDownload} />
                                            </button>
                                            <button
                                                className="edit-dlt-btn text-black"
                                                onClick={() => handleCopyToClipboard(gallery.GalleryImage)}
                                            >
                                                <FontAwesomeIcon icon={faCopy} />
                                            </button>
                                            <button
                                                className='edit-dlt-btn'
                                                style={{ color: "#0385C3" }}
                                                onClick={() => handleModalShow(gallery)}
                                            >
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                            <button
                                                className='edit-dlt-btn text-danger'
                                                onClick={() => handleDelete(gallery._id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
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
                                    return (
                                        <option key={cat._id} value={cat.CategoryId}>
                                            {cat.CategoryName}
                                        </option>
                                    );
                                })}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {formErrors.categoryId}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Select Prank Language<span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span></Form.Label>
                            <Form.Control
                                as="select"
                                value={formData.languageId}
                                className='py-2'
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, languageId: value });
                                    setFormErrors((prevErrors) => ({
                                        ...prevErrors,
                                        languageId: value ? '' : prevErrors.languageId,
                                    }));
                                }}
                                isInvalid={!!formErrors.languageId}
                            >
                                <option value="">Select a Prank Language</option>
                                {language.map((cat) => {
                                    return (
                                        <option key={cat._id} value={cat.LanguageId}>
                                            {cat.LanguageName}
                                        </option>
                                    );
                                })}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {formErrors.languageId}
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
                                    id="Safe"
                                    label="Safe Gallery Prank"
                                    checked={formData.safe}
                                    onChange={(e) => setFormData({ ...formData, safe: e.target.checked })}
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