import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// img
import logo from "../../assets/images/logo.svg";

const Category = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [fileLabel, setFileLabel] = useState('Category Image Upload');
    const [selectedType, setSelectedType] = useState('');

    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setFileLabel('Category Image Upload');
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setFileLabel('Category Image Upload');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/category/read')
            .then((res) => {
                const allData = res.data.data.reverse();
                setData(allData);
                filterData(allData, selectedType);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
                toast.error("Failed to fetch data.");
            });
    };

    const filterData = (dataToFilter, type) => {
        if (type) {
            setFilteredData(dataToFilter.filter(item => item.Type === type));
        } else {
            setFilteredData(dataToFilter);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        filterData(data, selectedType);
    }, [selectedType]);

    const portfolioSchema = Yup.object().shape({
        CategoryName: Yup.string().required('Category Name is required'),
        CategoryImage: Yup.mixed().required('Category Image is required'),
        Type: Yup.string().required('Type is required'),
    });

    const formik = useFormik({
        initialValues: {
            CategoryName: '',
            CategoryImage: '',
            Type: '',
        },
        validationSchema: portfolioSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const formData = new FormData();
            formData.append('CategoryName', values.CategoryName);
            formData.append('CategoryImage', values.CategoryImage);
            formData.append('Type', values.Type);

            const request = id !== undefined
                ? axios.patch(`https://pslink.world/api/category/update/${id}`, formData)
                : axios.post('https://pslink.world/api/category/create', formData);

            request.then((res) => {
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setFileLabel('Category Image Upload');
                getData();
                toast.success(res.data.message);
                toggleModal('add');
            }).catch((err) => {
                console.error(err);
                setSubmitting(false);
                toast.error("An error occurred. Please try again.");
            });
        },
    });

    const handleEdit = (cardBg) => {
        formik.setValues({
            CategoryName: cardBg.CategoryName,
            CategoryImage: cardBg.CategoryImage,
            Type: cardBg.Type || '',
        });
        setId(cardBg._id);
        setFileLabel('Category Image Upload');
        toggleModal('edit');
    };

    const handleDelete = (cardBgId) => {
        if (window.confirm("Are you sure you want to delete this Category?")) {
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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationItems = () => {
        let items = [];
        const totalPagesToShow = 8;

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
            <img src={logo} alt='loading....' style={{
                animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "200px"
            }} />
        </div>
    );
    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Category Images</h4>
                    <p>Category / Category</p>
                </div>
            </div>
            <div className='d-flex flex-wrap justify-content-between align-items-center mb-4'>
                <Button onClick={() => toggleModal('add')} className='rounded-3 border-0 mt-3' style={{ backgroundColor: "#FFD800", color: "black" }}>Add New Category Image</Button>
                <Form.Select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    style={{ width: 'auto' }}
                    className='mt-3'
                >
                    <option value="">All Types</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="gallery">Gallery</option>
                </Form.Select>
            </div>
            <Modal show={visible} onHide={() => toggleModal('add')} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{id ? "Edit Category" : "Add New Category"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="CategoryName"
                                name="CategoryName"
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
                            <Form.Label>{fileLabel}</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="CategoryImage"
                                    name="CategoryImage"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("CategoryImage", file);
                                        setFileLabel(file ? "Category Image uploaded" : "Category Image Upload");
                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Choose File"
                                    className="d-none"
                                    custom
                                />
                                <label htmlFor="CategoryImage" className="btn border bg-white mb-0">Select Image</label>
                            </div>
                            {formik.errors.CategoryImage && formik.touched.CategoryImage && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CategoryImage}
                                </div>
                            )}
                        </Form.Group>

                        {/* Type Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Control
                                as="select"
                                id="Type"
                                name="Type"
                                value={formik.values.Type}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.Type && !!formik.errors.Type}
                            >
                                <option value="">Select Type</option>
                                <option value="audio">Audio</option>
                                <option value="video">Video</option>
                                <option value="gallery">Gallery</option>
                            </Form.Control>
                            {formik.errors.Type && formik.touched.Type && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Type}
                                </div>
                            )}
                        </Form.Group>

                        <Button type="submit" className='bg-white border-0' disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Category Image</th>
                        <th>Category Name</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((cardBg, index) => (
                            <tr key={cardBg._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td><img src={cardBg.CategoryImage} alt='CategoryImage' width={100} /></td>
                                <td>{cardBg.CategoryName}</td>
                                <td>{cardBg.Type}</td>
                                <td>
                                    <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleEdit(cardBg)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button className='bg-transparent border-0 text-danger fs-5' onClick={() => handleDelete(cardBg._id)}>
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
        </div>
    );
};

export default Category;