import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// img
import logo from "../../assets/images/logo.png";

const CardTitle = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cardTitle, setCardTitle] = useState({
        eng: '',
        hindi: '',
        spanish: '',
        urdu: '',
        french: '',
        portugeese: '',
        indonesian: '',
        arabic: ''
    });
    const [errors, setErrors] = useState({});

    const toggleModal = () => {
        // Check the limit before showing the modal
        if (!visible && id === undefined && data.length >= 10) {
            toast.error("Card limit reached. Only 10 card titles are allowed.");
            return;
        }

        setVisible(!visible);

        if (!visible) {
            // Reset errors and card title state if closing the modal
            setErrors({});
            setCardTitle({
                eng: '',
                hindi: '',
                spanish: '',
                urdu: '',
                french: '',
                portugeese: '',
                indonesian: '',
                arabic: ''
            });
            setId(undefined);
        }
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://lolcards.link/api/cardTitle/read')
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
        // Validate that all fields are required
        Object.keys(cardTitle).forEach((key) => {
            if (!cardTitle[key]) {
                newErrors[key] = `${key} is required`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);

        const request = id !== undefined
            ? axios.patch(`https://lolcards.link/api/cardTitle/update/${id}`, cardTitle)
            : axios.post('https://lolcards.link/api/cardTitle/create', cardTitle);

        request
            .then((res) => {
                getData();
                toast.success(res.data.message);
                toggleModal(); // Close modal
            })
            .catch((err) => {
                console.error(err);
                const errorMessage = err.response?.data?.message || 'An error occurred';
                toast.error(errorMessage);
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const handleEdit = (title) => {
        setCardTitle({
            eng: title.eng,
            hindi: title.hindi,
            spanish: title.spanish,
            urdu: title.urdu,
            french: title.french,
            portugeese: title.portugeese,
            indonesian: title.indonesian,
            arabic: title.arabic
        });
        setId(title._id);
        setVisible(true);
    };

    const handleDelete = (titleId) => {
        if (window.confirm("Are you sure you want to delete this title?")) {
            axios.delete(`https://lolcards.link/api/cardTitle/delete/${titleId}`)
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
                    <h4>Card Title</h4>
                    <p>Utilities / Card Title</p>
                </div>
            </div>

            <Button onClick={toggleModal} className='my-4 rounded-3 border-0' style={{ backgroundColor: "#FA5D4D", color: "white" }}>Add New Title</Button>

            <Modal show={visible} onHide={toggleModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{id ? "Edit Title" : "Add New Title"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {Object.keys(cardTitle).map((key) => (
                            <Form.Group className="mb-3" key={key}>
                                <div className='d-flex justify-content-between'>
                                    <Form.Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Form.Label>
                                    <div className="text-end">
                                        <small
                                            style={{
                                                fontSize: "13px",
                                                color: cardTitle[key].length >= 20 ? "red" : "inherit"
                                            }}
                                        >
                                            {cardTitle[key].length} / 20
                                        </small>
                                    </div>
                                </div>
                                <Form.Control
                                    type="text"
                                    id={key}
                                    placeholder={`Enter ${key.charAt(0).toUpperCase() + key.slice(1)} Title`}
                                    value={cardTitle[key]}
                                    onChange={(e) => setCardTitle({ ...cardTitle, [key]: e.target.value })}
                                    isInvalid={!!errors[key]}
                                    maxLength={20}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors[key]}
                                </Form.Control.Feedback>
                            </Form.Group>
                        ))}
                        <Button type="submit" className='bg-white border-0' disabled={submitting}>
                            {submitting ? <Spinner animation="border" size="sm" /> : (id ? 'Update' : 'Submit')}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>English</th>
                        <th>Hindi</th>
                        <th>Spanish</th>
                        <th>Urdu</th>
                        <th>French</th>
                        <th>Portugeese</th>
                        <th>Indonesian</th>
                        <th>Arabic</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((title, index) => (
                        <tr key={title._id} className={index % 2 === 1 ? 'bg-light2' : 'bg-blue'}>
                            <td>{index + 1}</td>
                            <td>{title.eng}</td>
                            <td>{title.hindi}</td>
                            <td>{title.spanish}</td>
                            <td>{title.urdu}</td>
                            <td>{title.french}</td>
                            <td>{title.portugeese}</td>
                            <td>{title.indonesian}</td>
                            <td>{title.arabic}</td>
                            <td>
                                <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleEdit(title)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button className='bg-transparent border-0 text-danger fs-5' onClick={() => handleDelete(title._id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <ToastContainer />
        </div>
    );
};

export default CardTitle;
