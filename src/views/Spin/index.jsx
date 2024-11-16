import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Assuming you have a logo import
import logo from "../../assets/images/logo.svg";

const Spin = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [coverImageLabel, setCoverImageLabel] = useState('Cover Image Upload');
    const [fileLabel, setFileLabel] = useState('File Upload');

    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setCoverImageLabel('Cover Image Upload');
                setFileLabel('File Upload');
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setCoverImageLabel('Cover Image Upload');
            setFileLabel('File Upload');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/admin/spin/read')
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

    const spinSchema = Yup.object().shape({
        Name: Yup.string().required('Name is required'),
        CoverImage: Yup.mixed().required('Cover Image is required'),
        File: Yup.mixed().required('File is required'),
        Type: Yup.string().required('Type is required'),
    });

    const formik = useFormik({
        initialValues: {
            Name: '',
            CoverImage: '',
            File: '',
            Type: '',
        },
        validationSchema: spinSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const formData = new FormData();
            formData.append('Name', values.Name);
            formData.append('CoverImage', values.CoverImage);
            formData.append('File', values.File);
            formData.append('Type', values.Type);

            const request = id !== undefined
                ? axios.patch(`https://pslink.world/api/admin/spin/update/${id}`, formData)
                : axios.post('https://pslink.world/api/admin/spin/create', formData);

            request.then((res) => {
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setCoverImageLabel('Cover Image Upload');
                setFileLabel('File Upload');
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

    const handleEdit = (spin) => {
        formik.setValues({
            Name: spin.Name,
            CoverImage: spin.CoverImage,
            File: spin.File,
            Type: spin.Type,
        });
        setId(spin._id);
        setCoverImageLabel('Cover Image Upload');
        setFileLabel('File Upload');
        toggleModal('edit');
    };

    const handleDelete = (spinId) => {
        if (window.confirm("Are you sure you want to delete this Spin?")) {
            axios.delete(`https://pslink.world/api/admin/spin/delete/${spinId}`)
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
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

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
        <div className="h-screen flex justify-center items-center overflow-hidden">
            <img src={logo} alt='loading....' className="w-48 animate-pulse" />
        </div>
    );

    const MediaDisplay = ({ type, file, name }) => {
        switch (type.toLowerCase()) {
            case 'audio':
                return (
                    <audio controls>
                        <source src={file} type="audio/mpeg" />
                        <track
                            kind="captions"
                            src={name}
                            srcLang="en"
                            label="English"
                            default
                        />
                        Your browser does not support the audio element.
                    </audio>
                );
            case 'video':
                return (
                    <video controls width="240">
                        <source src={file} type="video/mp4" />
                        <track
                            kind="captions"
                            src={name}
                            srcLang="en"
                            label="English"
                            default
                        />
                        Your browser does not support the video element.
                    </video>
                );
            case 'gallery':
            case 'message':
                return (
                    <img src={file} alt="gallery thumbnail" style={{ width: '100px', height: '100px' }} />
                );
            default:
                return <span>{file}</span>;
        }
    };

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Spin Management</h4>
                    <p>Type / Spin Management</p>
                </div>
            </div>

            <Button
                onClick={() => toggleModal('add')}
                className='my-4 rounded-3 border-0'
                style={{ backgroundColor: "#FA5D4D", color: "white" }}
            >
                Add New Spin
            </Button>

            <Modal show={visible} onHide={() => toggleModal('add')} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{id ? "Edit Spin" : "Add New Spin"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="Name"
                                name="Name"
                                value={formik.values.Name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.Name && !!formik.errors.Name}
                            />
                            {formik.errors.Name && formik.touched.Name && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.Name}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{coverImageLabel}</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="CoverImage"
                                    name="CoverImage"
                                    onChange={(event) => {
                                        const file = event.currentTarget.files[0];
                                        formik.setFieldValue("CoverImage", file);
                                        setCoverImageLabel(file ? "Cover Image uploaded" : "Cover Image Upload");
                                    }}
                                    onBlur={formik.handleBlur}
                                    className="d-none"
                                />
                                <label htmlFor="CoverImage" className="btn border bg-white mb-0">Select Cover Image</label>
                            </div>
                            {formik.errors.CoverImage && formik.touched.CoverImage && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CoverImage}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{fileLabel}</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="File"
                                    name="File"
                                    onChange={(event) => {
                                        const file = event.currentTarget.files[0];
                                        formik.setFieldValue("File", file);
                                        setFileLabel(file ? "File uploaded" : "File Upload");
                                    }}
                                    onBlur={formik.handleBlur}
                                    className="d-none"
                                />
                                <label htmlFor="File" className="btn border bg-white mb-0">Select File</label>
                            </div>
                            {formik.errors.File && formik.touched.File && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.File}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Prank Type</Form.Label>
                            <Form.Select
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
                            </Form.Select>
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
                        <th>Name</th>
                        <th>Cover Image</th>
                        <th>File</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((spin, index) => (
                            <tr key={spin._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{spin.Name}</td>
                                <td>
                                    <img src={spin.CoverImage} alt="cover" style={{ width: '100px', height: '100px' }} />
                                </td>
                                <td>
                                    <MediaDisplay type={spin.Type} file={spin.File} name={spin.Name} />
                                </td>
                                <td>{spin.Type}</td>
                                <td>
                                    <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleEdit(spin)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button className='bg-transparent border-0 text-danger fs-5' onClick={() => handleDelete(spin._id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center">No Data Found</td>
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

export default Spin;