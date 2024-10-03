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
import logo from "../../assets/images/logo.png";

const CardBg = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [fileLabel, setFileLabel] = useState('Background Image Upload');

    const toggleModal = (mode) => {
        if (mode === 'add') {
            setId(undefined);
            setFileLabel('Background Image Upload');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://lolcards.link/api/cardBackground/read')
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
        cardBg: Yup.string().required('BackgroundImage is required'),
    });

    const formik = useFormik({
        initialValues: {
            cardBg: '',
        },
        validationSchema: portfolioSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const formData = new FormData();
            formData.append('cardBg', values.cardBg);

            const request = id !== undefined
                ? axios.patch(`https://lolcards.link/api/cardBackground/update/${id}`, formData)
                : axios.post('https://lolcards.link/api/cardBackground/create', formData);

            request.then((res) => {
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setFileLabel('Background Image Upload');
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
            cardBg: cardBg.backgroundImage,
        });
        setId(cardBg._id);
        setFileLabel('Background Image Upload');
        toggleModal('edit');
    };

    const handleDelete = (cardBgId) => {
        if (window.confirm("Are you sure you want to delete this Background?")) {
            axios.delete(`https://lolcards.link/api/cardBackground/delete/${cardBgId}`)
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
                    <h4>Card Background</h4>
                    <p>Utilities / CardBackground</p>
                </div>
            </div>
            <Button onClick={() => toggleModal('add')} className='my-4 rounded-3 border-0' style={{ backgroundColor: "#FA5D4D", color: "white" }}>Add New Background</Button>
            <Modal show={visible} onHide={() => toggleModal('add')} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{id ? "Edit Background" : "Add New Background"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>{fileLabel}</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="cardBg"
                                    name="cardBg"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("cardBg", file);
                                        setFileLabel(file ? "Background uploaded" : "Background Image Upload");

                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Choose File"
                                    className="d-none"
                                    custom
                                />
                                <label htmlFor="cardBg" className="btn border bg-white mb-0">Select Image</label>
                            </div>
                            {formik.errors.cardBg && formik.touched.cardBg && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.cardBg}
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
                        <th>Card Background</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((cardBg, index) => (
                        <tr key={cardBg._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td><img src={cardBg.cardBg} alt='cardBackground' width={100} /></td>
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

            {/* Pagination */}
            <div className='d-flex justify-content-center'>
                <Pagination>
                    {renderPaginationItems()}
                </Pagination>
            </div>

            <ToastContainer />
        </div>
    );
};

export default CardBg;
