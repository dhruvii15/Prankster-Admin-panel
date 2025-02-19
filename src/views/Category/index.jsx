import React from 'react';
import { Table } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';




const Category = () => {

    const data = [
        { CategoryId: 1, CategoryName: 'Trending' },
        { CategoryId: 2, CategoryName: 'Nonveg' },
        { CategoryId: 3, CategoryName: 'Hot' },
        { CategoryId: 4, CategoryName: 'Funny' },
        { CategoryId: 5, CategoryName: 'Horror' },
        { CategoryId: 6, CategoryName: 'Celebrity' }
    ];

    const language = [
        { LanguageId: 1, LanguageName: 'Hindi' },
        { LanguageId: 2, LanguageName: 'English' },
        { LanguageId: 3, LanguageName: 'Marathi' },
        { LanguageId: 4, LanguageName: 'Gujarati' },
        { LanguageId: 5, LanguageName: 'Tamil' },
        { LanguageId: 6, LanguageName: 'Punjabi' }
    ];


    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Prank Category</h4>
                </div>
            </div>


            <div className="table-responsive py-4">
                <Table bordered className='text-center fs-6 w-100 bg-white rounded-3'>
                    <thead>
                        <tr>
                            <td className='py-4' style={{ fontWeight: "600" }}>Id</td>
                            <td className='py-4' style={{ fontWeight: "600" }}>Prank Language</td>
                            <td className='py-4' style={{ fontWeight: "600" }}>Prank Category Name</td>
                        </tr>
                    </thead>
                    <tbody>
                        {language && language.length > 0 ? (
                            language.map((cardBg, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{cardBg.LanguageName}</td>
                                    <td>
                                        {data && data.length > 0 ? (
                                            data.map((cardBg, index) => (
                                                <p key={index}>{cardBg.CategoryName}</p>
                                            ))
                                        ) : (

                                            <p>No Data Found</p>
                                        )}
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
            </div>

        </div>
    );
};

export default Category;