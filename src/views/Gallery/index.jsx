import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import 'react-toastify/dist/ReactToastify.css';

// img
import logo from "../../assets/images/logo.svg";

const Gallery = () => {
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [id, setId] = useState();
    const [loading, setLoading] = useState(true);
    const [imageFileLabel, setImageFileLabel] = useState('Gallery Image Upload');


    const toggleModal = (mode) => {
        if (!visible) {
            if (mode === 'add') {
                setId(undefined);
                setImageFileLabel('Gallery Image Upload');
                formik.resetForm();
            }
        } else {
            formik.resetForm();
            setImageFileLabel('Gallery Image Upload');
        }
        setVisible(!visible);
    };

    const getData = () => {
        setLoading(true);
        axios.post('https://pslink.world/api/gallery/read')
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

    const getCharacters = () => {
        axios.post('https://pslink.world/api/character/read')
            .then((res) => {
                setCharacters(res.data.data);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch characters.");
            });
    };

    useEffect(() => {
        getData();
        getCharacters();
    }, []);

    const gallerySchema = Yup.object().shape({
        GalleryName: Yup.string().required('Gallery Name is required'),
        GalleryImage: Yup.mixed().required('Gallery Image is required'),
        GalleryPremium: Yup.boolean(),
        CharacterId: Yup.string().required('Character Name is required'),
        Hide: Yup.boolean(),
    });

    const formik = useFormik({
        initialValues: {
            GalleryName: '',
            GalleryImage: '',
            GalleryPremium: false,
            CharacterId: '',
            Hide: false,
        },
        validationSchema: gallerySchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            const formData = new FormData();
            formData.append('GalleryName', values.GalleryName);
            formData.append('GalleryImage', values.GalleryImage);
            formData.append('GalleryPremium', values.GalleryPremium);
            formData.append('CharacterId', values.CharacterId);
            formData.append('Hide', values.Hide);

            const request = id !== undefined
                ? axios.patch(`https://pslink.world/api/gallery/update/${id}`, formData)
                : axios.post('https://pslink.world/api/gallery/create', formData);

            request.then((res) => {
                setSubmitting(false);
                resetForm();
                setId(undefined);
                setImageFileLabel('Gallery Image Upload');
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

    const handleEdit = (gallery) => {
        formik.setValues({
            GalleryName: gallery.GalleryName,
            GalleryImage: gallery.GalleryImage,
            GalleryPremium: gallery.GalleryPremium,
            CharacterId: gallery.CharacterId,
            Hide: gallery.Hide,
        });
        setId(gallery._id);
        setImageFileLabel('Gallery Image Upload');
        toggleModal('edit');
    };

    const handleHideToggle = (galleryId, currentHideStatus) => {
        axios.patch(`https://pslink.world//api/gallery/update/${galleryId}`, { Hide: !currentHideStatus })
            .then((res) => {
                getData();
                toast.success(res.data.message);
            })
            .catch((err) => {
                console.error(err);
                toast.error("An error occurred. Please try again.");
            });
    };

    const handleDelete = (galleryId) => {
        if (window.confirm("Are you sure you want to delete this Gallery Image?")) {
            axios.delete(`https://pslink.world/api/gallery/delete/${galleryId}`)
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
                    <h4>Gallery </h4>
                    <p>Category / Gallery Management</p>
                </div>
            </div>
            <Button onClick={() => toggleModal('add')} className='my-4 rounded-3 border-0' style={{ backgroundColor: "#FA5D4D", color: "white" }}>Add New Gallery</Button>
            <Modal show={visible} onHide={() => toggleModal('add')} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{id ? "Edit Gallery" : "Add New Gallery"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Gallery Name</Form.Label>
                            <Form.Control
                                type="text"
                                id="GalleryName"
                                name="GalleryName"
                                value={formik.values.GalleryName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.GalleryName && !!formik.errors.GalleryName}
                            />
                            {formik.errors.GalleryName && formik.touched.GalleryName && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.GalleryName}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{imageFileLabel}</Form.Label>
                            <div className="d-flex align-items-center">
                                <Form.Control
                                    type="file"
                                    id="GalleryImage"
                                    name="GalleryImage"
                                    onChange={(event) => {
                                        let file = event.currentTarget.files[0];
                                        formik.setFieldValue("GalleryImage", file);
                                        setImageFileLabel(file ? "Gallery Image uploaded" : "Gallery Image Upload");
                                    }}
                                    onBlur={formik.handleBlur}
                                    label="Choose File"
                                    className="d-none"
                                    custom
                                />
                                <label htmlFor="GalleryImage" className="btn border bg-white mb-0">Select Gallery Image</label>
                            </div>
                            {formik.errors.GalleryImage && formik.touched.GalleryImage && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.GalleryImage}
                                </div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                id="GalleryPremium"
                                name="GalleryPremium"
                                label="Premium Gallery"
                                checked={formik.values.GalleryPremium}
                                onChange={formik.handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                id="Hide"
                                name="Hide"
                                label="Hide gallery"
                                checked={formik.values.Hide}
                                onChange={formik.handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Character Name</Form.Label>
                            <Form.Control
                                as="select"
                                id="CharacterId"
                                name="CharacterId"
                                value={formik.values.CharacterId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.CharacterId && !!formik.errors.CharacterId}
                            >
                                <option value="">Select a character</option>
                                {characters.map((character) => {
                                    if (character.Category === 'gallery') {
                                        return (
                                            <option key={character._id} value={character.CharacterId}>
                                                {character.CharacterName}
                                            </option>
                                        );
                                    }
                                    return null; // Return null for characters not in the gallery category
                                })}
                            </Form.Control>
                            {formik.errors.CharacterId && formik.touched.CharacterId && (
                                <div className="invalid-feedback d-block">
                                    {formik.errors.CharacterId}
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
                        <th>Gallery Name</th>
                        <th>Gallery Image</th>
                        <th>Premium</th>
                        <th>Hidden</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((gallery, index) => (
                            <tr key={gallery._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{gallery.GalleryName}</td>
                                <td>
                                    <img src={gallery.GalleryImage} alt="gallery thumbnail" style={{ width: '100px', height: '100px' }} />
                                </td>
                                <td>{gallery.GalleryPremium ? 'Yes' : 'No'}</td>
                                <td>
                                    <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleHideToggle(gallery._id, gallery.Hide)}>
                                        <FontAwesomeIcon icon={gallery.Hide ? faEyeSlash : faEye} />
                                    </Button>
                                </td>
                                <td>
                                    <Button className='bg-transparent border-0 fs-5' style={{ color: "#0385C3" }} onClick={() => handleEdit(gallery)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button className='bg-transparent border-0 text-danger fs-5' onClick={() => handleDelete(gallery._id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center">No Data Found</td> {/* Ensure the colSpan matches your table structure */}
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

export default Gallery;