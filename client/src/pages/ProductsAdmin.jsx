import { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { Package, Edit, Trash2, Plus, X, Upload } from 'lucide-react';
import API_URL from '../config/api';
import './ProductsAdmin.css';

const ProductsAdmin = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        profit: '',
        rating: '',
        description: '',
        image: ''
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/products`);
            const data = await response.json();
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert numeric fields
        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            profit: parseFloat(formData.profit),
            rating: parseFloat(formData.rating)
        };

        try {
            if (isEditing) {
                const response = await fetch(`${API_URL}/api/products/${editId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });
                if (response.ok) {
                    fetchProducts();
                    resetForm();
                }
            } else {
                const response = await fetch(`${API_URL}/api/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(productData)
                });
                if (response.ok) {
                    fetchProducts();
                    resetForm();
                }
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            profit: product.profit,
            rating: product.rating,
            description: product.description,
            image: product.image
        });
        setEditId(product.id);
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`${API_URL}/api/products/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchProducts();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            price: '',
            profit: '',
            rating: '',
            description: '',
            image: ''
        });
        setIsEditing(false);
        setEditId(null);
    };

    const handleImageUpload = async (file) => {
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: uploadData
            });
            const data = await response.json();
            if (data.imagePath) {
                setFormData(prev => ({
                    ...prev,
                    image: data.imagePath
                }));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                handleImageUpload(file);
                break;
            }
        }
    };

    return (
        <div className="admin-page">
            <AdminNavbar />
            <div className="products-admin-container">
                <div className="products-admin-header">
                    <div>
                        <h1 className="page-title">Product Management</h1>
                        <p className="page-subtitle">Add, edit, and remove products</p>
                    </div>
                </div>

                <div className="product-form-card">
                    <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="product-form-grid">
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Home Decor">Home Decor</option>
                                    <option value="Accessories">Accessories</option>
                                    <option value="Toys">Toys</option>
                                    <option value="Office">Office</option>
                                    <option value="keychains">Keychains</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Profit (₹)</label>
                                <input
                                    type="number"
                                    name="profit"
                                    value={formData.profit}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Rating</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    max="5"
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Image</label>
                                <div
                                    className="image-upload-container"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onPaste={handlePaste}
                                >
                                    <div className="image-input-wrapper">
                                        <input
                                            type="text"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleInputChange}
                                            placeholder="/images/..."
                                            required
                                        />
                                        <div className="upload-icon-wrapper">
                                            <Upload size={20} className="text-gray-400" />
                                        </div>
                                    </div>
                                    <small className="help-text">
                                        Drag & drop an image here, or paste (Ctrl+V)
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                required
                            />
                        </div>
                        <div className="form-actions">
                            {isEditing && (
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                            <button type="submit" className="btn btn-primary">
                                {isEditing ? 'Update Product' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="products-table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Profit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>#{product.id}</td>
                                    <td>
                                        <img src={product.image} alt={product.name} className="product-image-thumb" />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>₹{product.price}</td>
                                    <td>₹{product.profit}</td>
                                    <td>
                                        <button className="action-btn edit-btn" onClick={() => handleEdit(product)}>
                                            <Edit size={18} />
                                        </button>
                                        <button className="action-btn delete-btn" onClick={() => handleDelete(product.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductsAdmin;
