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

const AudioCharacter = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [fileLabel, setFileLabel] = useState('Character Image Upload');

    const toggleModal = (mode) => {
        if (mode === 'add') {
            setId(undefined);
            setFileLabel('Character Image Upload');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('http://localhost:5001/api/audio/character/read')
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

    const portfolioSchema = Yup.object().shape({
        CharacterName: Yup.string().required('Character Name is required'),
        CharacterImage: Yup.mixed().required('Character Image is required'),
    });

    const formik = useFormik({
        initialValues: {
            CharacterName: '',
            CharacterImage: '',
        },
        validationSchema: portfolioSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const formData = new FormData();
            formData.append('CharacterName', values.CharacterName);
            formData.append('CharacterImage', values.CharacterImage);

            const request = id !== undefined
                ? axios.patch(`http://localhost:5001/api/audio/character/update/${id}`, formData)
                : axios.post('http://localhost:5001/api/audio/character/create', formData);

            request.then((res) => {
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setFileLabel('Character Image Upload');
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
            CharacterName: cardBg.CharacterName,
            CharacterImage: cardBg.CharacterImage,
        });
        setId(cardBg._id);
        setFileLabel('Character Image Upload');
        toggleModal('edit');
    };

    const handleDelete = (cardBgId) => {
        if (window.confirm("Are you sure you want to delete this Character?")) {
            axios.delete(`http://localhost:5001/api/audio/character/delete/${cardBgId}`)
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
                animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "300px"
            }} />
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Character Images</h4>
                    <p>Utilities / CharacterImage</p>
                </div>
            </div>
            <Button onClick={() => toggleModal('add')} className='my-4 rounded-3 border-0' style={{ backgroundColor: "#FA5D4D", color: "white" }}>Add New Character Image</Button>
            <Modal show={visible} onHide={() => toggleModal('add')} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{id ? "Edit Character" : "Add New Character"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Character Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="CharacterName"
                                name="CharacterName"
                                value={formik.values.CharacterName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.CharacterName && !!formik.errors.CharacterName}
                            />
                            {formik.errors.CharacterName && formik.touched.CharacterName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CharacterName}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{fileLabel}</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="CharacterImage"
                                    name="CharacterImage"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("CharacterImage", file);
                                        setFileLabel(file ? "Character Image uploaded" : "Character Image Upload");
                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Choose File"
                                    className="d-none"
                                    custom
                                />
                                <label htmlFor="CharacterImage" className="btn border bg-white mb-0">Select Image</label>
                            </div>
                            {formik.errors.CharacterImage && formik.touched.CharacterImage && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CharacterImage}
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
                        <th>Character Image</th>
                        <th>Character Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((cardBg, index) => (
                        <tr key={cardBg._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td><img src={cardBg.CharacterImage} alt='CharacterImage' width={100} /></td>
                            <td>{cardBg.CharacterName}</td>
                            <td>
                                <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleEdit(cardBg)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button className='bg-transparent border-0 text-danger fs-5' onClick={() => handleDelete(cardBg._id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Pagination>
                <Pagination.Prev onClick={() => currentPage > 1 && paginate(currentPage - 1)} disabled={currentPage === 1} />
                {renderPaginationItems()}
                <Pagination.Next onClick={() => currentPage < totalPages && paginate(currentPage + 1)} disabled={currentPage === totalPages} />
            </Pagination>

            <ToastContainer />
        </div>
    );
};

export default AudioCharacter;
