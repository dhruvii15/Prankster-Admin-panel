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

const CoverURL = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const categories = ['emoji', 'realistic'];
    const [fileLabel, setFileLabel] = useState('Cover Image Upload');

    // Pagination state for each category
    const [emojiPage, setEmojiPage] = useState(1);
    const [realisticPage, setRealisticPage] = useState(1);

    const itemsPerPage = 10;  // Number of items per page

    const toggleModal = (mode) => {
        if (mode === 'add') {
            setId(undefined);
            setFileLabel('Cover Image Upload');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('http://localhost:5001/api/cover/read')
            .then((res) => {
                setData(res.data.data.reverse());
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

    const groupByCategory = (category) => {
        return data.filter(cover => cover.Category === category);
    };

    const coverSchema = Yup.object().shape({
        CoverURL: Yup.string().required('CoverImage is required'),
        Category: Yup.string().required('Category is required'),  // New validation for Category
    });

    const formik = useFormik({
        initialValues: {
            CoverURL: '',
            Category: '',  // Initial value for Category
        },
        validationSchema: coverSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const formData = new FormData();
            formData.append('CoverURL', values.CoverURL);
            formData.append('Category', values.Category);  // Append Category to form data

            const request = id !== undefined
                ? axios.patch(`http://localhost:5001/api/cover/update/${id}`, formData)
                : axios.post('http://localhost:5001/api/cover/create', formData);

            request.then((res) => {
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setFileLabel('Cover Image Upload');
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

    const handleEdit = (CoverURL) => {
        formik.setValues({
            CoverURL: CoverURL.CoverURL,
            Category: CoverURL.Category || '',  // Set Category value when editing
        });
        setId(CoverURL._id);
        setFileLabel('Cover Image Upload');
        toggleModal('edit');
    };

    const handleDelete = (coverId) => {
        if (window.confirm("Are you sure you want to delete this Cover Image?")) {
            axios.delete(`http://localhost:5001/api/cover/delete/${coverId}`)
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

    const paginate = (pageNumber, category) => {
        if (category === 'emoji') setEmojiPage(pageNumber);
        if (category === 'realistic') setRealisticPage(pageNumber);
    };

    const renderPaginationItems = (category, totalItems) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        let currentPage = category === 'emoji' ? emojiPage : realisticPage;

        let items = [];
        for (let i = 1; i <= totalPages; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => paginate(i, category)}
                >
                    {i}
                </Pagination.Item>
            );
        }
        return items;
    };

    const getCurrentItems = (categoryData, currentPage) => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return categoryData.slice(indexOfFirstItem, indexOfLastItem);
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
                    <h4>Cover Image</h4>
                    <p>Utilities / CoverImage</p>
                </div>
            </div>
            <Button onClick={() => toggleModal('add')} className='my-4 rounded-3 border-0' style={{ backgroundColor: "#FFD800" }}>Add New CoverImage</Button>
            <Modal show={visible} onHide={() => toggleModal('add')} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{id ? "Edit CoverImage" : "Add New CoverImage"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>{fileLabel}</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="CoverURL"
                                    name="CoverURL"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("CoverURL", file);
                                        setFileLabel(file ? "CoverImage uploaded" : "Cover Image Upload");
                                    }}
                                    onBlur={formik.handleBlur}
                                    className="d-none"
                                />
                                <label htmlFor="CoverURL" className="btn border bg-white mb-0">Select Image</label>
                            </div>
                            {formik.errors.CoverURL && formik.touched.CoverURL && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CoverURL}
                                </div>
                            )}
                        </Form.Group>

                        {/* New Category dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                id="Category"
                                name="Category"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.Category}
                            >
                                <option value="emoji">Emoji</option>
                                <option value="realistic">Realistic</option>
                            </Form.Select>
                            {formik.errors.Category && formik.touched.Category && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Category}
                                </div>
                            )}
                        </Form.Group>

                        <Button type="submit" className='bg-white border-0' disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {categories.map((category) => {
                const categoryData = groupByCategory(category);
                const currentPage = category === 'emoji' ? emojiPage : realisticPage;
                const currentItems = getCurrentItems(categoryData, currentPage);

                return (
                    <div key={category}>
                        <h5 className='py-3'>{category === 'emoji' ? 'Emoji' : 'Realistic'} Category :</h5>
                        <Table striped bordered hover responsive className='text-center fs-6'>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Cover</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((cover, index) => (
                                    <tr key={cover._id} >
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td><img src={cover.CoverURL} alt={'CoverImage'} style={{ width: '150px', height: '120px' }} /></td>
                                        <td>
                                            <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleEdit(cover)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                            <Button className='bg-transparent border-0 text-danger fs-5' onClick={() => handleDelete(cover._id)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <div className='d-flex justify-content-center'>
                            <Pagination>
                                {renderPaginationItems(category, categoryData.length)}
                            </Pagination>
                        </div>
                    </div>
                );
            })}
            <ToastContainer />
        </div>
    );
};

export default CoverURL;
