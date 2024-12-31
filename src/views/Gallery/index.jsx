import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination, Row, Col, Spinner, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faToggleOn, faToggleOff, faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import { faCopy, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import 'react-toastify/dist/ReactToastify.css';

// img
import logo from "../../assets/images/logo.svg";
import ImagePreviewModal from 'components/ImagePreviewModal';

const Gallery = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [category, setCategory] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [imageFileLabel, setImageFileLabel] = useState('Image Prank Image Upload');
    const [filteredData, setFilteredData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [isOn, setIsOn] = useState(false);
    const [isSubmitting2, setIsSubmitting2] = useState(false);
    const [adminId, setAdminId] = useState(null);

    // New state for category and additional filters
    const [activeTab, setActiveTab] = useState('all');
    const [selectedFilter, setSelectedFilter] = useState('');

    const getAdminData = () => {
        axios.get('https://pslink.world/api/admin/read')
            .then((res) => {
                setIsOn(res.data.data[0].ImageSafe);
                setAdminId(res.data.data[0]._id);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch admin data.");
            });
    };

    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setImageFileLabel('Image Prank Image Upload');
                setSelectedFileName('');
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setSelectedFileName('');
            setImageFileLabel('Image Prank Image Upload');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/gallery/read')
            .then((res) => {
                const newData = res.data.data.reverse();
                setData(newData);
                filterGalleryData(newData, activeTab, selectedFilter);
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
                setCategory(res.data.data.filter(cat => cat.Type.includes('gallery')));
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch category.");
            });
    };

    useEffect(() => {
        getData();
        getCategory();
        getAdminData();
    }, []);

    const getFilteredCount = (categoryId = null, filterType = '') => {
        // First filter by safe/unsafe status
        let filtered = data.filter(item => item.Unsafe === !isOn);

        // Then apply category filter if specified
        if (categoryId) {
            filtered = filtered.filter(item => item.CategoryId === categoryId);
        }

        // Finally apply additional filters
        switch (filterType) {
            case "Hide":
                return filtered.filter(item => item.Hide).length;
            case "Unhide":
                return filtered.filter(item => !item.Hide).length;
            case "Premium":
                return filtered.filter(item => item.GalleryPremium).length;
            case "Free":
                return filtered.filter(item => !item.GalleryPremium).length;
            default:
                return filtered.length;
        }
    };

    // Updated filtering function
    const filterGalleryData = (dataToFilter, categoryTab, additionalFilter) => {
        // First filter by safe/unsafe status
        let filtered = dataToFilter.filter(item => item.Unsafe === !isOn);

        // Then filter by category
        if (categoryTab !== 'all') {
            const selectedCategory = category.find(cat => cat.CategoryName.toLowerCase() === categoryTab);
            if (selectedCategory) {
                filtered = filtered.filter(item => item.CategoryId === selectedCategory.CategoryId);
            }
        }

        // Apply additional filters
        switch (additionalFilter) {
            case "Hide":
                filtered = filtered.filter(item => item.Hide === true);
                break;
            case "Unhide":
                filtered = filtered.filter(item => item.Hide === false);
                break;
            case "Premium":
                filtered = filtered.filter(item => item.GalleryPremium === true);
                break;
            case "Free":
                filtered = filtered.filter(item => item.GalleryPremium === false);
                break;
            default:
                break;
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    };

    // Update useEffect to handle filtering
    useEffect(() => {
        filterGalleryData(data, activeTab, selectedFilter);
    }, [activeTab, selectedFilter, data, isOn]);

    const handleToggle = async () => {
        if (!isSubmitting2) {
            const newState = !isOn;
            try {
                setIsSubmitting2(true);
                setIsOn(newState);

                // Call the appropriate API based on the state
                const apiEndpoint = newState ? 'safe' : 'unsafe';
                const response = await axios.post(`https://pslink.world/api/${apiEndpoint}/${adminId}`, { type: "3" });

                // Reset to first page when toggling safe mode
                setCurrentPage(1);
                getData();
                getAdminData();

                toast.success(response.data.message);
            } catch (error) {
                console.error('Error updating safe status:', error);
                toast.error("Failed to update safe status.");
                setIsOn(!newState); // Revert to previous state on error
            } finally {
                setIsSubmitting2(false);
            }
        }
    };

    // Update useEffect to handle filtering
    useEffect(() => {
        filterGalleryData(data, activeTab, selectedFilter);
    }, [activeTab, selectedFilter, data]);

    const gallerySchema = Yup.object().shape({
        GalleryName: Yup.string().required('Image Prank Name is required'),
        GalleryImage: Yup.mixed()
            .test(
                'fileValidation',
                'Only image files are allowed (e.g., .jpg, .png, .jpeg)',
                function (value) {
                    // If editing and no new file is selected, skip validation
                    if (typeof value === 'string') return true;

                    // For new entries or when a new file is selected during edit
                    if (!value) {
                        // Required only for new entries
                        return this.parent.isEditing ? true : false;
                    }

                    // Validate file type if a file is provided
                    if (value instanceof File) {
                        const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
                        return allowedExtensions.includes(value.type);
                    }

                    return false;
                }
            ),
        GalleryPremium: Yup.boolean(),
        CategoryId: Yup.string().required('Prank Category Name is required'),
        Hide: Yup.boolean(),
        isEditing: Yup.boolean()
    });

    const formik = useFormik({
        initialValues: {
            GalleryName: '',
            GalleryImage: '',
            GalleryPremium: false,
            CategoryId: '',
            Hide: false,
            isEditing: false,
            Unsafe: true
        },
        validationSchema: gallerySchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setIsSubmitting(true);
                const formData = new FormData();
                formData.append('GalleryName', values.GalleryName);
                if (values.GalleryImage instanceof File) {
                    formData.append('GalleryImage', values.GalleryImage);
                }
                formData.append('GalleryPremium', values.GalleryPremium);
                formData.append('CategoryId', values.CategoryId);
                formData.append('Hide', values.Hide);
                formData.append('Unsafe', "true");

                const request = id !== undefined
                    ? axios.patch(`https://pslink.world/api/gallery/update/${id}`, formData)
                    : axios.post('https://pslink.world/api/gallery/create', formData);

                const res = await request;
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setImageFileLabel('Image Prank Image Upload');
                getData();
                toast.success(res.data.message);
                toggleModal('add');
            } catch (err) {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            } finally {
                setIsSubmitting(false);
                setSubmitting(false);
            }
        },
    });

    const handleEdit = (gallery) => {
        const fileName = gallery.GalleryImage.split('/').pop();
        setSelectedFileName(fileName);

        formik.setValues({
            GalleryName: gallery.GalleryName,
            GalleryImage: gallery.GalleryImage,
            GalleryPremium: gallery.GalleryPremium,
            CategoryId: gallery.CategoryId,
            Hide: gallery.Hide,
            isEditing: true
        });
        setId(gallery._id);
        setImageFileLabel('Image Prank Image Upload');
        toggleModal('edit');
    };

    const handleHideToggle = (galleryId, currentHideStatus) => {
        axios.patch(`https://pslink.world/api/gallery/update/${galleryId}`, { Hide: !currentHideStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handlePremiumToggle = (galleryId, currentPremiumStatus) => {
        axios.patch(`https://pslink.world/api/gallery/update/${galleryId}`, { GalleryPremium: !currentPremiumStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleDelete = (galleryId) => {
        if (window.confirm("Are you sure you want to delete this Image Prank Image?")) {
            axios.delete(`https://pslink.world/api/gallery/delete/${galleryId}`)
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

    const handleShowPreview = (currentPageIndex) => {
        // Calculate the actual index in the full filtered dataset
        const actualIndex = (currentPage - 1) * itemsPerPage + currentPageIndex;
        setPreviewIndex(actualIndex);
        setShowPreview(true);
    };

    // Navigation in preview should work across all pages
    const handlePreviewNavigation = (newIndex) => {
        if (newIndex >= 0 && newIndex < filteredData.length) {
            setPreviewIndex(newIndex);
            // Calculate which page this image is on
            const newPage = Math.floor(newIndex / itemsPerPage) + 1;
            // Update the current page if necessary
            if (newPage !== currentPage) {
                setCurrentPage(newPage);
            }
        }
    };

    // Pagination logic
    const itemsPerPage = 15;
    const [currentPage, setCurrentPage] = useState(1);

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

    const handleCopyToClipboard = (gallery) => {
        if (gallery?.GalleryImage) {
            navigator.clipboard.writeText(gallery.GalleryImage)
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
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Image Prank</h4>
                </div>
                <Form className='d-flex align-items-center gap-3'>
                    <span>Safe : </span>
                    <Form.Check
                        type="switch"
                        id="custom-switch"
                        checked={isOn}
                        onChange={handleToggle}
                        className="custom-switch-lg"
                        style={{ transform: 'scale(1.3)' }}
                        disabled={isSubmitting2}
                    />
                </Form>
            </div>
            <div className='d-flex justify-content-between align-items-sm-center mt-4 flex-column-reverse flex-sm-row'>
                {/* Filters Dropdown */}
                <Button
                    onClick={() => toggleModal('add')}
                    className='rounded-3 border-0'
                    style={{ backgroundColor: "#F9E238", color: "black" }}
                >
                    Add Image Prank
                </Button>
                <Form.Select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    style={{ width: 'auto' }}
                >
                    <option value="">All</option>
                    <option value="Hide">Hide</option>
                    <option value="Unhide">Unhide</option>
                    <option value="Premium">Premium</option>
                    <option value="Free">Free</option>
                </Form.Select>
            </div>

            {/* Category Tabs Navigation */}
            <Nav variant="tabs" className='pt-5'>
                <Nav.Item>
                    <Nav.Link
                        active={activeTab === 'all'}
                        className={activeTab === 'all' ? 'active-tab' : ''}
                        onClick={() => {
                            setActiveTab('all');
                            setCurrentPage(1);
                        }}
                    >
                        All ({getFilteredCount(null, selectedFilter)})
                    </Nav.Link>
                </Nav.Item>
                {category.map((cat) => (
                    <Nav.Item key={cat._id}>
                        <Nav.Link
                            active={activeTab === cat.CategoryName.toLowerCase()}
                            className={activeTab === cat.CategoryName.toLowerCase() ? 'active-tab' : ''}
                            onClick={() => {
                                setActiveTab(cat.CategoryName.toLowerCase());
                                setCurrentPage(1);
                            }}
                        >
                            <span className="pe-2">{cat.CategoryName}</span>
                            ({getFilteredCount(cat.CategoryId, selectedFilter)})
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>

            <Modal
                show={visible}
                onHide={() => !isSubmitting && toggleModal('add')}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header >
                    <Modal.Title>{id ? "Edit Image Prank" : "Add Image Prank"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Prank Category Name<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                as="select"
                                id="CategoryId"
                                name="CategoryId"
                                className='py-2'
                                value={formik.values.CategoryId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.CategoryId && !!formik.errors.CategoryId}
                            >
                                <option value="">Select a Prank Category</option>
                                {category.map((category) => {
                                    if (category.Type === 'gallery') {
                                        return (
                                            <option key={category._id} value={category.CategoryId}>
                                                {category.CategoryName}
                                            </option>
                                        );
                                    }
                                    return null; // Return null for category not in the gallery category
                                })}
                            </Form.Control>
                            {formik.errors.CategoryId && formik.touched.CategoryId && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CategoryId}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Image Prank Name<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="GalleryName"
                                name="GalleryName"
                                className='py-2'
                                placeholder="Enter Image Prank Name"
                                value={formik.values.GalleryName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.GalleryName && !!formik.errors.GalleryName}
                            />
                            {formik.errors.GalleryName && formik.touched.GalleryName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.GalleryName}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>{imageFileLabel}
                                <span className='ps-2' style={{ fontSize: "12px" }}></span>
                                <span className='text-danger fw-normal' style={{ fontSize: "17px" }}>* </span>
                            </Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="GalleryImage"
                                    name="GalleryImage"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("GalleryImage", file);
                                        setSelectedFileName(file ? file.name : '');
                                        setImageFileLabel(file ? "Image Prank Image uploaded" : "Image Prank Image Upload");
                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Choose File"
                                    className="d-none"
                                    custom
                                />
                                <label htmlFor="GalleryImage" className="btn mb-0 p-4 bg-white w-100 rounded-2" style={{ border: "1px dotted #c1c1c1" }}>
                                    <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                    <div style={{ color: "#c1c1c1" }} className='pt-1'>Select Image Prank Image</div>
                                    {selectedFileName && (
                                        <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                            {selectedFileName}
                                        </span>
                                    )}
                                </label>
                            </div>
                            {formik.errors.GalleryImage && formik.touched.GalleryImage && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.GalleryImage}
                                </div>
                            )}
                        </Form.Group>

                        <div className='d-flex flex-wrap gap-sm-4'>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="GalleryPremium"
                                    name="GalleryPremium"
                                    label="Premium Image Prank"
                                    checked={formik.values.GalleryPremium}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="Hide"
                                    name="Hide"
                                    label="Hide Image Prank"
                                    checked={formik.values.Hide}
                                    onChange={formik.handleChange}
                                />
                            </Form.Group>
                        </div>

                        <Row className="mt-2">
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
                                    {isSubmitting ? <Spinner size='sm' /> : 'Submit'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Image Prank Name</th>
                        <th>Image Prank Image</th>
                        <th>Prank Category</th>
                        <th>Premium</th>
                        <th>Hidden</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((gallery, index) => (
                            <tr key={gallery._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td style={{
                                    backgroundColor: gallery.Hide ? '#ffcccc' : ''
                                }}>{indexOfFirstItem + index + 1}</td>
                                <td>{gallery.GalleryName}</td>
                                <td>
                                    <button
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handleShowPreview(index)}
                                    >
                                        <img
                                            src={gallery.GalleryImage}
                                            alt="Gallery thumbnail"
                                            style={{ width: '100px', height: '100px' }}
                                        />
                                    </button>
                                </td>

                                <td>{gallery.CategoryName}</td>
                                <td>
                                    <Button
                                        className='bg-transparent border-0 fs-4'
                                        style={{ color: gallery.GalleryPremium ? "#0385C3" : "#6c757d" }}
                                        onClick={() => handlePremiumToggle(gallery._id, gallery.GalleryPremium)}
                                    >
                                        <FontAwesomeIcon
                                            icon={gallery.GalleryPremium ? faToggleOn : faToggleOff}
                                            title={gallery.GalleryPremium ? "Premium ON" : "Premium OFF"}
                                        />
                                    </Button>
                                </td>
                                <td>
                                    <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleHideToggle(gallery._id, gallery.Hide)}>
                                        <FontAwesomeIcon icon={gallery.Hide ? faEyeSlash : faEye} />
                                    </Button>
                                </td>
                                <td>
                                    <Button
                                        className="edit-dlt-btn text-black"
                                        onClick={() => handleCopyToClipboard(gallery)} // Use an arrow function to pass the parameter
                                    >
                                        <FontAwesomeIcon icon={faCopy} />
                                    </Button>
                                    <Button className='edit-dlt-btn' style={{ color: "#0385C3" }} onClick={() => handleEdit(gallery)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button className='edit-dlt-btn text-danger' onClick={() => handleDelete(gallery._id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={8} className="text-center">No Data Found</td>
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

            <ImagePreviewModal
                show={showPreview}
                onHide={() => setShowPreview(false)}
                images={filteredData.map(item => item.GalleryImage)}
                currentIndex={previewIndex}
                onNavigate={handlePreviewNavigation}
                totalImages={filteredData.length}
            />
        </div>
    );
};

export default Gallery;