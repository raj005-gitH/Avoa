import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getListing, updateListing, deleteListing } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', location: '', country: '' });
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id).then((r) => r.data),
  });

  useEffect(() => {
    if (data?.listing) {
      const l = data.listing;
      setForm({ title: l.title, description: l.description || '', price: l.price || '', location: l.location || '', country: l.country || '' });
      setPreview(l.image?.url || null);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('listing[title]', form.title);
      fd.append('listing[description]', form.description);
      fd.append('listing[price]', form.price);
      fd.append('listing[location]', form.location);
      fd.append('listing[country]', form.country);
      if (newImage) fd.append('listing[image]', newImage);
      return updateListing(id, fd);
    },
    onSuccess: () => { toast.success('Listing updated!'); navigate(`/listings/${id}`); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteListing(id),
    onSuccess: () => { toast.success('Listing deleted'); navigate('/'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setNewImage(file); setPreview(URL.createObjectURL(file)); }
  };

  if (isLoading) return (
    <><Navbar /><div className="page-content spinner-wrap"><div className="spinner" /></div></>
  );

  return (
    <>
      <Navbar />
      <div className="page-content">
        <motion.div className="listing-form-page" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h1>Edit listing</h1>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => { if (window.confirm('Are you sure you want to delete this listing?')) deleteMutation.mutate(); }}
              disabled={deleteMutation.isPending}
            >
              🗑 Delete
            </button>
          </div>
          <p className="subtitle">Update your listing details below.</p>

          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={4} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price per night (₹)</label>
                  <input className="form-control" name="price" type="number" min="1" value={form.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input className="form-control" name="country" value={form.country} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input className="form-control" name="location" value={form.location} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-section">
              <h3>Update Photo</h3>
              {preview && (
                <div className="img-preview" style={{ marginBottom: 16 }}>
                  <img src={preview} alt="Current" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="form-control" />
            </div>

            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </motion.div>
        <Footer />
      </div>
    </>
  );
}
