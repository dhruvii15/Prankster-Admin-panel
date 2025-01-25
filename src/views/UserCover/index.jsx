import React, { useEffect, useState } from 'react';
import { Button, Table, Pagination, Form, Modal, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrash, faTimes, faChevronUp, faChevronDown, faDownload } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ImagePreviewModal from 'components/ImagePreviewModal';

const UserCover = () => {
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);
    const [category, setCategory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedCover, setSelectedCover] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [customTagName, setCustomTagName] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        CoverName: '',  // Add this new state for cover name
        CoverPremium: false,
        Hide: false
    });
    const [showPreview, setShowPreview] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    const maxTags = 7;
    const itemsPerPage = 15;

    // Sort and prepare available tags alphabetically
    const availableTags = category && category.length > 0
        ? category.map(c => c || '').filter(tag => tag.trim() !== '').sort((a, b) => a.localeCompare(b))
        : [];

    const visibleTags = isExpanded ? availableTags : availableTags.slice(0, 7);
    const totalTags = availableTags.length;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            if (customTagName.trim() && selectedTags.length < maxTags && !selectedTags.includes(customTagName.trim())) {
                handleCustomTagAdd();
            }
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.CoverName) {  // Add validation for cover name
            errors.CoverName = 'Cover name is required';
        }
        if (selectedTags.length === 0) {
            errors.tags = 'At least one tag is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when field is updated
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/users/read', { TypeId: "4" })
            .then((res) => {
                setFilteredData(res.data.data.reverse());
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch data.");
                setLoading(false);
            });
    };

    const getCategory = () => {
        axios.post('https://pslink.world/api/cover/TagName/read')
            .then((res) => {
                setCategory(res.data.data || []);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch Tag Name.");
            });
    };

    useEffect(() => {
        getData();
        getCategory();
    }, []);

    const handleCheckClick = (cover) => {
        setSelectedCover(cover);
        setSelectedTags([]);
        // Set the cover name in form data when modal opens
        setFormData(prev => ({
            ...prev,
            CoverName: cover.CoverName || '',
            CoverPremium: false,
            Hide: false,
            Unsafe: true,
        }));
        setShowModal(true);
    };

    const handleTagSelect = (tag) => {
        if (selectedTags.length < maxTags && !selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const removeTag = (tagToRemove) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    const handleCustomTagAdd = () => {
        if (customTagName.trim() && selectedTags.length < maxTags && !selectedTags.includes(customTagName.trim())) {
            setSelectedTags([...selectedTags, customTagName.trim()]);
            setCustomTagName('');
        }
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
        }

        const apiFormData = new FormData();
        apiFormData.append('CoverURL', selectedCover.CoverURL);
        apiFormData.append('CoverName', formData.CoverName);  // Use the updated cover name
        apiFormData.append('CoverPremium', formData.CoverPremium);
        apiFormData.append('Hide', formData.Hide);
        apiFormData.append('role', selectedCover._id);
        apiFormData.append('Unsafe', 'true');
        apiFormData.append('TagName', JSON.stringify(selectedTags));

        if (window.confirm("Are you sure you want to move this Cover Image?")) {
            axios.post('https://pslink.world/api/cover/create', apiFormData)
                .then((res) => {
                    getData();
                    toast.success(res.data.message);
                    setShowModal(false);
                    resetForm();
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                });
        }
    };

    const resetForm = () => {
        setFormData({
            CoverName: '',  // Reset cover name
            CoverPremium: false,
            Hide: false,
            Unsafe: true
        });
        setSelectedTags([]);
        setFormErrors({});
    };

    const handleDelete = (coverId) => {
        if (window.confirm("Are you sure you want to delete this Cover Image?")) {
            axios.delete(`https://pslink.world/api/users/delete/${coverId}?TypeId=4`)
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

    const handlePreviewClick = (index) => {
        // Calculate the actual index in filteredData based on current page and clicked index
        const actualIndex = indexOfFirstItem + index;
        setPreviewIndex(actualIndex);
        setShowPreview(true);
    };

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

    const handleDownload = (imageUrl) => {
        fetch(imageUrl)
            .then((response) => response.blob()) // Convert the image to a Blob
            .then((blob) => {
                const url = window.URL.createObjectURL(blob); // Create an object URL
                const link = document.createElement('a');
                link.href = url;
                link.download = 'cover-image.jpg'; // Set the default download filename
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url); // Release the URL object
            })
            .catch((error) => console.error('Download failed:', error));
    };


    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="d-sm-flex justify-content-between align-items-center pb-5">
                <div>
                    <h4>Cover</h4>
                </div>
            </div>

            <Table striped bordered hover responsive className="text-center fs-6">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Cover Name</th>
                        <th>Cover Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((cover, index) => (
                            <tr key={cover._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{cover.CoverName}</td>
                                <td>
                                    <button
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handlePreviewClick(index)}
                                    >
                                        <img
                                            src={cover.CoverURL || 'placeholder.jpg'}
                                            alt="cover thumbnail"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />
                                    </button>
                                </td>

                                <td>
                                    <Button
                                        className="edit-dlt-btn"
                                        onClick={() => handleDownload(cover.CoverURL)} // Pass your image URL here
                                    >
                                        <FontAwesomeIcon icon={faDownload} />
                                    </Button>
                                    <Button
                                        className="edit-dlt-btn"
                                        style={{ color: "#0385C3" }}
                                        onClick={() => handleCheckClick(cover)}
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                    <Button
                                        className="edit-dlt-btn text-danger"
                                        onClick={() => handleDelete(cover._id)}
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

            {totalPages > 1 && (
                <div className="d-flex justify-content-center">
                    <Pagination>{renderPaginationItems()}</Pagination>
                </div>
            )}

            <Modal centered show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>Select Tags</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-4">
                        <Form.Label className='fw-bold'>
                            Cover Name
                            <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            id="CoverName"
                            name="CoverName"
                            value={formData.CoverName}
                            onChange={handleFormChange}
                            className={`py-2 ${formErrors.CoverName ? 'is-invalid' : ''}`}
                            placeholder="Enter cover name"
                        />
                        {formErrors.CoverName && (
                            <div className="invalid-feedback">{formErrors.CoverName}</div>
                        )}
                    </Form.Group>


                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                            Searching Tags
                            <span className="text-danger ps-2 fw-normal" style={{ fontSize: "17px" }}>*</span>
                        </Form.Label>

                        {/* Selected Tags */}
                        <div className="mb-3 d-flex flex-wrap gap-2">
                            {selectedTags.map((tag, index) => (
                                <div
                                    key={index}
                                    className="px-2 rounded d-flex align-items-center"
                                    style={{ border: "1px solid #c1c1c1" }}
                                >
                                    <span>{tag}</span>
                                    <Button
                                        variant="link"
                                        className="p-0 ms-2"
                                        onClick={() => removeTag(tag)}
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="text-danger" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Add Custom Tag Input - Modified with Enter key support */}
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <Form.Control
                                type="text"
                                value={customTagName}
                                onChange={(e) => setCustomTagName(e.target.value)}
                                onKeyDown={handleKeyDown} // Add Enter key support
                                placeholder="Add custom tag"
                                className={formErrors.tags ? "is-invalid" : ""}
                            />
                            <Button
                                style={{ backgroundColor: "#F9E238", color: "black" }}
                                className="border-0 rounded-2 px-5"
                                onClick={handleCustomTagAdd}
                                disabled={!customTagName.trim() || selectedTags.length >= maxTags || selectedTags.includes(customTagName.trim())}
                            >
                                Add
                            </Button>
                        </div>

                        {/* Tags List */}
                        <div
                            style={{
                                width: "100%",
                                maxHeight: "120px",
                                overflowY: "auto",
                            }}
                        >
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                {visibleTags.map((tag, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => handleTagSelect(tag)}
                                        disabled={selectedTags.includes(tag) || selectedTags.length >= maxTags}
                                        className="py-1 px-2 rounded-2"
                                        style={{
                                            backgroundColor: selectedTags.includes(tag) ? "#e9ecef" : "#f8f9fa",
                                            border: "1px solid #dee2e6",
                                            color: selectedTags.includes(tag) ? "#6c757d" : "#212529",
                                            cursor: selectedTags.includes(tag) ? "default" : "pointer",
                                            fontSize: "13px",
                                        }}
                                    >
                                        {tag}
                                    </Button>
                                ))}

                                {/* Toggle Expand Button */}
                                {totalTags > 7 && !isExpanded && (
                                    <span
                                        style={{ marginLeft: "8px", fontWeight: "bold", cursor: "pointer" }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                toggleExpand();
                                            }
                                        }}
                                        onClick={toggleExpand}
                                        className="border px-2 py-1 rounded-2"
                                    >
                                        + {totalTags - 7}
                                    </span>
                                )}

                                {totalTags > 7 && (
                                    <Button
                                        onClick={toggleExpand}
                                        className="py-1 px-2 ms-auto"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                toggleExpand();
                                            }
                                        }}
                                        style={{
                                            border: "none",
                                            backgroundColor: "transparent",
                                            color: "#212529",
                                        }}
                                    >
                                        {isExpanded ? (
                                            <FontAwesomeIcon icon={faChevronUp} />
                                        ) : (
                                            <FontAwesomeIcon icon={faChevronDown} />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Error Message for Tags */}
                        {formErrors.tags && (
                            <div className="invalid-feedback d-block mt-2">{formErrors.tags}</div>
                        )}
                    </Form.Group>


                    <div className='d-flex flex-wrap gap-sm-4'>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                id="CoverPremium"
                                name="CoverPremium"
                                label="Premium Cover"
                                checked={formData.CoverPremium}
                                onChange={handleFormChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                id="Hide"
                                name="Hide"
                                label="Hide Cover"
                                checked={formData.Hide}
                                onChange={handleFormChange}
                            />
                        </Form.Group>
                    </div>

                    <Row className="mt-2">
                        <Col xs={6}>
                            <Button
                                variant="secondary"
                                onClick={() => setShowModal(false)}
                                className='w-100 rounded-3 text-black'
                                style={{ background: "#F6F7FB" }}
                            >
                                Cancel
                            </Button>
                        </Col>
                        <Col xs={6}>
                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                className='submit border-0 rounded-3 w-100'
                            >
                                Submit
                            </Button>
                        </Col>
                    </Row>

                </Modal.Body>
            </Modal>
            <ToastContainer />



            <ImagePreviewModal
                show={showPreview}
                onHide={() => setShowPreview(false)}
                images={filteredData.map(item => item.CoverURL)} // Use filteredData instead of currentItems
                currentIndex={previewIndex}
                onNavigate={(newIndex) => {
                    if (newIndex >= 0 && newIndex < filteredData.length) { // Check against filteredData length
                        setPreviewIndex(newIndex);
                    }
                }}
            />
        </div>
    );
};

export default UserCover;