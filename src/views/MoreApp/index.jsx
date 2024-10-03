import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// img
import logo from "../../assets/images/logo.png";

const MoreAPP = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [enAppName, setEnAppName] = useState('');
    const [hiAppName, setHiAppName] = useState('');
    const [esAppName, setEsAppName] = useState('');
    const [urAppName, setUrAppName] = useState('');
    const [frAppName, setFrAppName] = useState('');
    const [ptAppName, setPtAppName] = useState('');
    const [inAppName, setInAppName] = useState('');
    const [arAppName, setArAppName] = useState('');
    const [packageName, setPackageName] = useState('');
    const [appId, setAppId] = useState('');
    const [errors, setErrors] = useState({});

    const toggleModal = (editMode = false) => {
        if (!editMode) {
            setEnAppName('');
            setHiAppName('');
            setEsAppName('');
            setUrAppName('');
            setFrAppName('');
            setPtAppName('');
            setInAppName('');
            setArAppName('');
            setPackageName('');
            setAppId('');
            setId(undefined);
        }
        setVisible(!visible);
        setErrors({});
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://lolcards.link/api/moreApp/read')
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
        if (!enAppName) newErrors.enAppName = 'English App Name is required';
        if (!hiAppName) newErrors.hiAppName = 'Hindi App Name is required';
        if (!esAppName) newErrors.esAppName = 'Spanish App Name is required';
        if (!urAppName) newErrors.urAppName = 'Urdu App Name is required';
        if (!frAppName) newErrors.frAppName = 'French App Name is required';
        if (!ptAppName) newErrors.ptAppName = 'Portuguese App Name is required';
        if (!inAppName) newErrors.inAppName = 'Indonesian App Name is required';
        if (!arAppName) newErrors.arAppName = 'Arabic App Name is required';
        if (!packageName) newErrors.packageName = 'Package Name is required';
        if (!appId) newErrors.appId = 'App ID is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const request = id !== undefined
            ? axios.patch(`https://lolcards.link/api/moreApp/update/${id}`, {
                enAppName, hiAppName, esAppName, urAppName, frAppName, ptAppName, inAppName, arAppName, packageName, appId
            })
            : axios.post('https://lolcards.link/api/moreApp/create', {
                enAppName, hiAppName, esAppName, urAppName, frAppName, ptAppName, inAppName, arAppName, packageName, appId
            });

        request.then((res) => {
            setEnAppName('');
            setHiAppName('');
            setEsAppName('');
            setUrAppName('');
            setFrAppName('');
            setPtAppName('');
            setInAppName('');
            setArAppName('');
            setPackageName('');
            setAppId('');
            setId(undefined);
            getData();
            toast.success(res.data.message);
            toggleModal();
        }).catch((err) => {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        });
    };

    const handleEdit = (app) => {
        setEnAppName(app.enAppName);
        setHiAppName(app.hiAppName);
        setEsAppName(app.esAppName);
        setUrAppName(app.urAppName);
        setFrAppName(app.frAppName);
        setPtAppName(app.ptAppName);
        setInAppName(app.inAppName);
        setArAppName(app.arAppName);
        setPackageName(app.packageName);
        setAppId(app.appId);
        setId(app._id);
        toggleModal(true);
    };

    const handleDelete = (appId) => {
        if (window.confirm("Are you sure you want to delete this app?")) {
            axios.delete(`https://lolcards.link/api/moreApp/delete/${appId}`)
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
                    <h4>More App</h4>
                    <p>Utilities / MoreApp</p>
                </div>
            </div>

            <Button onClick={() => toggleModal(false)} className='my-4 rounded-3 border-0' style={{ backgroundColor: "#FA5D4D", color: "white" }}>Add New App</Button>

            <Modal show={visible} onHide={() => toggleModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{id ? "Edit App" : "Add New App"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>English App Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="enAppName"
                                placeholder='Enter English App Name'
                                value={enAppName}
                                onChange={(e) => setEnAppName(e.target.value)}
                                isInvalid={!!errors.enAppName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.enAppName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Hindi App Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="hiAppName"
                                placeholder='Enter Hindi App Name'
                                value={hiAppName}
                                onChange={(e) => setHiAppName(e.target.value)}
                                isInvalid={!!errors.hiAppName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.hiAppName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Spanish App Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="esAppName"
                                placeholder='Enter Spanish App Name'
                                value={esAppName}
                                onChange={(e) => setEsAppName(e.target.value)}
                                isInvalid={!!errors.esAppName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.esAppName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Urdu App Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="urAppName"
                                placeholder='Enter Urdu App Name'
                                value={urAppName}
                                onChange={(e) => setUrAppName(e.target.value)}
                                isInvalid={!!errors.urAppName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.urAppName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>French App Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="frAppName"
                                placeholder='Enter French App Name'
                                value={frAppName}
                                onChange={(e) => setFrAppName(e.target.value)}
                                isInvalid={!!errors.frAppName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.frAppName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Portugeese App Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="ptAppName"
                                placeholder='Enter Portugeese App Name'
                                value={ptAppName}
                                onChange={(e) => setPtAppName(e.target.value)}
                                isInvalid={!!errors.ptAppName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.ptAppName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Indonesian App Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="inAppName"
                                placeholder='Enter Indonesian App Name'
                                value={inAppName}
                                onChange={(e) => setInAppName(e.target.value)}
                                isInvalid={!!errors.inAppName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.inAppName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Arabic App Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="arAppName"
                                placeholder='Enter Arabic App Name'
                                value={arAppName}
                                onChange={(e) => setArAppName(e.target.value)}
                                isInvalid={!!errors.arAppName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.arAppName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Package Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="packageName"
                                placeholder='Enter Package Name'
                                value={packageName}
                                onChange={(e) => setPackageName(e.target.value)}
                                isInvalid={!!errors.packageName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.packageName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>App Id</Form.Label>
                            <Form.Control
                                type="text"
                                id="appId"
                                placeholder='Enter App Id'
                                value={appId}
                                onChange={(e) => setAppId(e.target.value)}
                                isInvalid={!!errors.appId}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.appId}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button type="submit" className='bg-white border-0'>
                            {id ? 'Update' : 'Submit'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>English Name</th>
                        <th>Hindi Name</th>
                        <th>Spanish Name</th>
                        <th>Urdu Name</th>
                        <th>French Name</th>
                        <th>Portugeese Name</th>
                        <th>Indonesian Name</th>
                        <th>Arabic Name</th>
                        <th>Package Name</th>
                        <th>App Id</th>
                        <th>Logo</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((app, index) => (
                        <tr key={app._id} className={index % 2 === 1 ? 'bg-light2' : 'bg-blue'}>
                            <td>{index + 1}</td>
                            <td>{app.enAppName}</td>
                            <td>{app.hiAppName}</td>
                            <td>{app.esAppName}</td>
                            <td>{app.urAppName}</td>
                            <td>{app.frAppName}</td>
                            <td>{app.ptAppName}</td>
                            <td>{app.inAppName}</td>
                            <td>{app.arAppName}</td>
                            <td>{app.packageName}</td>
                            <td>{app.appId}</td>
                            <td><img src={app.logo} alt={app.enAppName} style={{ width: "50px" }} /></td>
                            <td>
                                <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleEdit(app)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button className='bg-transparent border-0 text-danger fs-5' onClick={() => handleDelete(app._id)}>
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

export default MoreAPP;
