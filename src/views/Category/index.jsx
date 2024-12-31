import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination, Nav, Row, Col, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// img
import logo from "../../assets/images/logo.svg";
import ImagePreviewModal from 'components/ImagePreviewModal';

const Category = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [fileLabel, setFileLabel] = useState('Prank Category Image Upload');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    const getActualImageIndex = (pageIndex) => {
        return indexOfFirstItem + pageIndex;
    };

    // Get all images for the preview modal based on filtered data
    const getAllFilteredImages = () => {
        return filteredItems.map(item => item.CategoryImage);
    };

    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setFileLabel('Prank Category Image Upload');
                setSelectedFileName('');
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setFileLabel('Prank Category Image Upload');
            setSelectedFileName('');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/category/read')
            .then((res) => {
                const allData = res.data.data.reverse();
                setData(allData);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };

    // Get filtered data based on selected types
    const getFilteredData = () => {
        if (activeTab === 'all') return data;
        return data.filter(item =>
            item.Type.split(',').includes(activeTab)
        );
    };

    useEffect(() => {
        getData();
    }, []);

    const portfolioSchema = Yup.object().shape({
        CategoryName: Yup.string().required('Prank Category Name is required'),
        CategoryImage: Yup.mixed()
            .test(
                'fileValidation',
                'Only image files are allowed (e.g., .jpg, .png, .jpeg)',
                function (value) {
                    if (typeof value === 'string') return true;

                    if (!value) {
                        return this.parent.isEditing ? true : false;
                    }

                    if (value instanceof File) {
                        const allowedExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
                        return allowedExtensions.includes(value.type);
                    }

                    return false;
                }
            ),
        Type: Yup.array()
            .min(1, 'Select at least one type')
            .required('Type is required'),
        isEditing: Yup.boolean()
    });

    const formik = useFormik({
        initialValues: {
            CategoryName: '',
            CategoryImage: '',
            Type: [],
            isEditing: false
        },
        validationSchema: portfolioSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                setIsSubmitting(true);
                const formData = new FormData();
                formData.append('CategoryName', values.CategoryName);
                // Only append new image if it's a File object
                if (values.CategoryImage instanceof File) {
                    formData.append('CategoryImage', values.CategoryImage);
                }
                formData.append('Type', JSON.stringify(values.Type));

                const request = id !== undefined
                    ? axios.patch(`https://pslink.world/api/category/update/${id}`, formData)
                    : axios.post('https://pslink.world/api/category/create', formData);

                const res = await request;
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setFileLabel('Prank Category Image Upload');
                setSelectedFileName('');
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

    const handleEdit = (cardBg) => {
        const fileName = cardBg.CategoryImage.split('/').pop();
        setSelectedFileName(fileName);
        const typeArray = cardBg.Type.split(',');

        formik.setValues({
            CategoryName: cardBg.CategoryName,
            CategoryImage: cardBg.CategoryImage,
            Type: [typeArray[0]], // Take only the first type for radio button
            isEditing: true
        });
        setId(cardBg._id);
        setFileLabel('Prank Category Image Upload');
        toggleModal('edit');
    };

    const handleTypeChange = (type, checked) => {
        let newTypes;
        if (id) {
            // For edit mode (radio buttons)
            newTypes = [type];
        } else {
            // For add mode (checkboxes)
            newTypes = checked
                ? [...formik.values.Type, type]
                : formik.values.Type.filter(t => t !== type);
        }
        formik.setFieldValue('Type', newTypes, false);
    };

    const handleDelete = (cardBgId) => {
        if (window.confirm("Are you sure you want to delete this Prank Category?")) {
            axios.delete(`https://pslink.world/api/category/delete/${cardBgId}`)
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

    // Pagination logic
    const itemsPerPage = 15;
    const [currentPage, setCurrentPage] = useState(1);

    const filteredItems = getFilteredData();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

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

    const renderTypeInputs = () => (
        <div className='d-flex flex-wrap'>
            {['audio', 'video', 'gallery'].map((type) => (
                <Form.Check
                    key={type}
                    type={id ? "radio" : "checkbox"}
                    id={`type-${type}`}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    name="Type"
                    value={type}
                    checked={formik.values.Type.includes(type)}
                    onChange={(e) => handleTypeChange(type, e.target.checked)}
                    className="mb-2 px-4"
                />
            ))}
        </div>
    );

    const getCategoryCount = (type) => {
        if (type === 'all') return data.length;
        return data.filter(item => item.Type.split(',').includes(type)).length;
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
                    <h4>Prank Category</h4>
                </div>
            </div>


            <Button onClick={() => toggleModal('add')} className='rounded-3 border-0 my-4' style={{ backgroundColor: "#F9E238", color: "black" }}>Add Prank Category</Button>

            <div className='d-flex justify-content-between align-items-sm-center flex-column-reverse flex-sm-row'>
                {/* Tabs Navigation */}
                <Nav variant="tabs" className="my-2">
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'all'}
                            className={activeTab === 'all' ? 'active-tab' : ''}
                            onClick={() => {
                                setActiveTab('all');
                                setCurrentPage(1);
                            }}
                        >
                            All ({getCategoryCount('all')})
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'audio'}
                            className={activeTab === 'audio' ? 'active-tab' : ''}
                            onClick={() => {
                                setActiveTab('audio');
                                setCurrentPage(1);
                            }}
                        >
                            Audio ({getCategoryCount('audio')})
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'video'}
                            className={activeTab === 'video' ? 'active-tab' : ''}
                            onClick={() => {
                                setActiveTab('video');
                                setCurrentPage(1);
                            }}
                        >
                            Video ({getCategoryCount('video')})
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            active={activeTab === 'gallery'}
                            className={activeTab === 'gallery' ? 'active-tab' : ''}
                            onClick={() => {
                                setActiveTab('gallery');
                                setCurrentPage(1);
                            }}
                        >
                            Gallery ({getCategoryCount('gallery')})
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>
            <Modal
                show={visible}
                onHide={() => !isSubmitting && toggleModal('add')}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header>
                    <Modal.Title>{id ? "Edit Prank Category" : "Add Prank Category"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        {/* Type Checkboxes */}
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Type<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            {renderTypeInputs()}
                            {formik.errors.Type && formik.touched.Type && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Type}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Prank Category Name<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="CategoryName"
                                name="CategoryName"
                                className="py-2"
                                placeholder="Enter CategoryName"
                                value={formik.values.CategoryName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.CategoryName && !!formik.errors.CategoryName}
                            />
                            {formik.errors.CategoryName && formik.touched.CategoryName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CategoryName}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>{fileLabel} <span style={{ fontSize: "12px" }}></span>
                                <span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <div className="d-flex flex-column">
                                <div className="d-flex align-items-center">
                                    <Form.Control
                                        type="file"
                                        id="CategoryImage"
                                        name="CategoryImage"
                                        onChange={(event) => {
                                            let file = event.currentTarget.files[0];
                                            formik.setFieldValue("CategoryImage", file);
                                            setFileLabel("Category Image uploaded");
                                            setSelectedFileName(file ? file.name : '');
                                        }}
                                        onBlur={formik.handleBlur}
                                        label="Choose File"
                                        className="d-none"
                                        custom
                                    />
                                    <label htmlFor="CategoryImage" className="btn mb-0 p-4 bg-white w-100 rounded-2" style={{ border: "1px dotted #c1c1c1" }}>
                                        <FontAwesomeIcon icon={faArrowUpFromBracket} style={{ fontSize: "15px" }} />
                                        <div style={{ color: "#c1c1c1" }}>Select Prank Category Image</div>
                                        {selectedFileName && (
                                            <span style={{ fontSize: "0.8rem", color: "#5E95FE" }}>
                                                {selectedFileName}
                                            </span>
                                        )}
                                    </label>
                                </div>
                            </div>
                            {formik.errors.CategoryImage && formik.touched.CategoryImage && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CategoryImage}
                                </div>
                            )}
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
                                <Button type="submit" className='submit border-0 rounded-3 w-100' disabled={isSubmitting}>
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
                        <th>Prank Category Image</th>
                        <th>Prank Category Name</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((cardBg, index) => (
                            <tr key={cardBg._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>
                                    <button
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => {
                                            // Use the actual index in the full dataset
                                            setPreviewIndex(getActualImageIndex(index));
                                            setShowPreview(true);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setPreviewIndex(getActualImageIndex(index));
                                                setShowPreview(true);
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        <img
                                            src={cardBg.CategoryImage}
                                            alt="CategoryImage"
                                            width={100}
                                        />
                                    </button>
                                </td>
                                <td>{cardBg.CategoryName}</td>
                                <td>{cardBg.Type}</td>
                                <td>
                                    <Button className='edit-dlt-btn' style={{ color: "#0385C3" }} onClick={() => handleEdit(cardBg)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button className='edit-dlt-btn text-danger' onClick={() => handleDelete(cardBg._id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center">No Data Found</td>
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
                images={getAllFilteredImages()}
                currentIndex={previewIndex}
                onNavigate={(newIndex) => {
                    if (newIndex >= 0 && newIndex < filteredItems.length) {
                        setPreviewIndex(newIndex);
                    }
                }}
            />
        </div>
    );
};

export default Category;