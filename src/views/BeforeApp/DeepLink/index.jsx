import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Row, Col, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// img
import logo from "../../../assets/images/logo.svg";

const DeepLink = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [source, setsource] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleModal = (mode) => {
        if (!isSubmitting) {
            if (mode === 'add') {
                setsource('');
                setId(undefined);
            }
            setErrors({});
            setVisible(!visible);
        }
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/analytics/read')
            .then((res) => {
                setData(res.data.data);
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

    const validate = () => {
        const newErrors = {};
        if (!source) newErrors.source = 'Source is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            source: source
        };

        try {
            setIsSubmitting(true);
            const request = id !== undefined
                ? axios.patch(`https://pslink.world/api/analytics/update/${id}`, payload)
                : axios.post('https://pslink.world/api/analytics/create', payload);

            const res = await request;
            setsource('');
            setId(undefined);
            getData();
            toast.success(res.data.message);
            toggleModal('add');
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (source) => {
        if (!isSubmitting) {
            setsource(source.source);
            setId(source._id);
            toggleModal('edit');
        }
    };

    const handleDelete = async (sourceId) => {
        if (!isSubmitting && window.confirm("Are you sure you want to delete this deeplink?")) {
            try {
                setIsSubmitting(true);
                const res = await axios.delete(`https://pslink.world/api/analytics/delete/${sourceId}`);
                getData();
                toast.success(res.data.message);
            } catch (err) {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
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
                    <h4>DeepLink</h4>
                </div>
            </div>

            <div className='d-flex align-items-center gap-4 justify-content-between pt-4'>
                <Button
                    onClick={() => toggleModal('add')}
                    className='my-4 rounded-3 border-0'
                    style={{ backgroundColor: "#F9E238" }}
                    disabled={isSubmitting}
                >
                    Add New DeepLink
                </Button>
            </div>

            <Modal
                show={visible}
                onHide={() => !isSubmitting && toggleModal('add')}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header>
                    <Modal.Title>{id ? "Edit DeepLink" : "Add New DeepLink"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Source<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="source"
                                className='py-2'
                                placeholder='Enter source'
                                value={source}
                                onChange={(e) => setsource(e.target.value)}
                                isInvalid={!!errors.source}
                                disabled={isSubmitting}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.source}
                            </Form.Control.Feedback>
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
                                <Button
                                    type="submit"
                                    className='submit border-0 rounded-3 w-100'
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Spinner size='sm' /> : (id ? 'Update' : 'Submit')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>Source</th>
                        <th>DeepLink</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((source, index) => (
                            <tr key={source._id} className={index % 2 === 1 ? 'bg-light2' : 'bg-blue'}>
                                <td>{index + 1}</td>
                                <td>{source.source}</td>
                                <td style={{
                                    minWidth: "450px",
                                    width: "450px",
                                    maxWidth: "450px",
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                    whiteSpace: "normal"
                                }}>
                                    <a
                                        href={source.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-decoration-none text-black"
                                        style={{ display: "block", wordBreak: "break-word" }}
                                    >
                                        {source.link}
                                    </a>
                                </td>
                                <td>
                                    <Button
                                        className='edit-dlt-btn'
                                        style={{ color: "#0385C3" }}
                                        onClick={() => handleEdit(source)}
                                        disabled={isSubmitting}
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button
                                        className='edit-dlt-btn text-danger'
                                        onClick={() => handleDelete(source._id)}
                                        disabled={isSubmitting}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">No data found</td>
                        </tr>
                    )}

                </tbody>
            </Table>

            <ToastContainer />
        </div>
    );
};

export default DeepLink;