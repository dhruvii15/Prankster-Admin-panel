import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Row, Col, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// img
import logo from "../../assets/images/logo.svg";

const Ads = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [adsName, setAdsName] = useState('');
    const [iosadsId, setIosAdsId] = useState('');
    const [androidadsId, setAndroidAdsId] = useState('');
    const [errors, setErrors] = useState({});
    const [isOn, setIsOn] = useState(false);
    const [adminId, setAdminId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleModal = (mode) => {
        if (!isSubmitting) {
            if (mode === 'add') {
                setAdsName('');
                setIosAdsId('');
                setAndroidAdsId('');
                setId(undefined);
            }
            setErrors({});
            setVisible(!visible);
        }
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/ads/read')
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

    const getAdminData = () => {
        axios.get('https://pslink.world/api/admin/read')
            .then((res) => {
                setIsOn(res.data.data[0].AdsStatus);
                setAdminId(res.data.data[0]._id);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch admin data.");
            });
    };

    useEffect(() => {
        getData();
        getAdminData();
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!adsName) newErrors.adsName = 'Ads Name is required';
        if (!iosadsId) newErrors.iosadsId = 'Ios Id is required';
        if (!androidadsId) newErrors.androidadsId = 'Android Id is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setIsSubmitting(true);
            const request = id !== undefined
                ? axios.patch(`https://pslink.world/api/ads/update/${id}`, { AdsName: adsName, IosAdsId: iosadsId , AndroidAdsId: androidadsId})
                : axios.post('https://pslink.world/api/ads/create', { AdsName: adsName, IosAdsId: iosadsId , AndroidAdsId: androidadsId});

            const res = await request;
            setAdsName('');
            setIosAdsId('');
            setAndroidAdsId('');
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

    const handleEdit = (ads) => {
        if (!isSubmitting) {
            setAdsName(ads.AdsName);
            setIosAdsId(ads.IosAdsId);
            setAndroidAdsId(ads.AndroidAdsId);
            setId(ads._id);
            toggleModal('edit');
        }
    };

    const handleDelete = async (adsId) => {
        if (!isSubmitting && window.confirm("Are you sure you want to delete this ad?")) {
            try {
                setIsSubmitting(true);
                const res = await axios.delete(`https://pslink.world/api/ads/delete/${adsId}`);
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

    const handleToggle = async () => {
        if (!isSubmitting) {
            const newState = !isOn;
            try {
                setIsSubmitting(true);
                setIsOn(newState);

                if (adminId) {
                    const response = await axios.patch(`https://pslink.world/api/admin/update/${adminId}`, {
                        AdsStatus: newState
                    });
                    toast.success(response.data.message);
                    getAdminData();
                } else {
                    toast.error("Admin ID not available.");
                    setIsOn(!newState);
                }
            } catch (error) {
                console.error('Error updating AdsStatus:', error);
                toast.error("Failed to update AdsStatus.");
                setIsOn(!newState);
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
                    <h4>Ads</h4>
                </div>
                <Form className='pe-5 d-flex align-items-center gap-3'>
                    <span>Ads Status : </span>
                    <Form.Check
                        type="switch"
                        id="custom-switch"
                        label={isOn ? 'On' : 'Off'}
                        checked={isOn}
                        onChange={handleToggle}
                        className="custom-switch-lg"
                        style={{ transform: 'scale(1.3)' }}
                        disabled={isSubmitting}
                    />
                </Form>
            </div>

            <Button
                onClick={() => toggleModal('add')}
                className='my-4 rounded-3 border-0'
                style={{ backgroundColor: "#F9E238" }}
                disabled={isSubmitting}
            >
                Add New Ad
            </Button>

            <Modal
                show={visible}
                onHide={() => !isSubmitting && toggleModal('add')}
                centered
                backdrop={isSubmitting ? 'static' : true}
                keyboard={!isSubmitting}
            >
                <Modal.Header >
                    <Modal.Title>{id ? "Edit Ads" : "Add New Ads"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Ads Name<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                as="select"
                                id="adsName"
                                value={adsName}
                                onChange={(e) => setAdsName(e.target.value)}
                                className="py-2 overflow-hidden"
                                isInvalid={!!errors.adsName}
                                disabled={isSubmitting}
                            >
                                <option value="" label="Select Ads Name" />
                                <option value="banner" label="Banner" />
                                <option value="nativesmall" label="Nativesmall" />
                                <option value="nativebig" label="Nativebig" />
                                <option value="intertitial" label="Intertitial" />
                                <option value="reward" label="Reward" />
                                <option value="appopen" label="App Open" />
                                <option value="appid" label="AppId" />
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {errors.adsName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Ios AdsId<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="iosadsId"
                                className='py-2'
                                placeholder='Enter Ios AdsId'
                                value={iosadsId}
                                onChange={(e) => setIosAdsId(e.target.value)}
                                isInvalid={!!errors.iosadsId}
                                disabled={isSubmitting}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.iosadsId}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className='fw-bold'>Android AdsId<span className='text-danger ps-2 fw-normal' style={{ fontSize: "17px" }}>* </span></Form.Label>
                            <Form.Control
                                type="text"
                                id="androidadsId"
                                className='py-2'
                                placeholder='Enter Ios AdsId'
                                value={androidadsId}
                                onChange={(e) => setAndroidAdsId(e.target.value)}
                                isInvalid={!!errors.androidadsId}
                                disabled={isSubmitting}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.androidadsId}
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
                        <th>AdsName</th>
                        <th>Ios AdsId</th>
                        <th>Android AdsId</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((ads, index) => (
                        <tr key={ads._id} className={index % 2 === 1 ? 'bg-light2' : 'bg-blue'}>
                            <td>{index + 1}</td>
                            <td>{ads.AdsName}</td>
                            <td>{ads.IosAdsId}</td>
                            <td>{ads.AndroidAdsId}</td>
                            <td>
                                <Button
                                    className='edit-dlt-btn'
                                    style={{ color: "#0385C3" }}
                                    onClick={() => handleEdit(ads)}
                                    disabled={isSubmitting}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button
                                    className='edit-dlt-btn text-danger'
                                    onClick={() => handleDelete(ads._id)}
                                    disabled={isSubmitting}
                                >
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

export default Ads;