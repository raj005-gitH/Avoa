import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { createListing } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NewListing() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', price: '', location: '', country: '',
  });

  const onDrop = useCallback((accepted) => {
    const file = accepted[0];
    if (file) setPreview({ file, url: URL.createObjectURL(file) });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: false,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('listing[title]', form.title);
      fd.append('listing[description]', form.description);
      fd.append('listing[price]', form.price);
      fd.append('listing[location]', form.location);
      fd.append('listing[country]', form.country);
      if (preview?.file) fd.append('listing[image]', preview.file);
      return createListing(fd);
    },
    onSuccess: () => {
      toast.success('Listing created successfully! 🎉');
      navigate('/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create listing'),
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <>
      <Navbar />
      <div className="page-content">
        <motion.div
          className="listing-form-page"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>List your space</h1>
          <p className="subtitle">Share your place with travellers from around the world.</p>

          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
            {/* Basic Info */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label className="form-group">Title</label>
                <input className="form-control" name="title" placeholder="e.g. Cozy mountain cabin" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" name="description" placeholder="Tell guests what makes your place special..." value={form.description} onChange={handleChange} rows={4} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price per night (₹)</label>
                  <input className="form-control" name="price" type="number" min="1" placeholder="e.g. 3500" value={form.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input className="form-control" name="country" placeholder="e.g. India" value={form.country} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input className="form-control" name="location" placeholder="e.g. Manali, Himachal Pradesh" value={form.location} onChange={handleChange} required />
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-section">
              <h3>Photos</h3>
              <div
                {...getRootProps()}
                className={`img-dropzone${isDragActive ? ' drag-over' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="icon">📷</div>
                <p>{isDragActive ? 'Drop it here!' : 'Drag & drop a photo, or click to select'}</p>
                <p style={{ fontSize: '0.78rem', marginTop: 6, color: 'var(--gray-400,#aaa)' }}>PNG, JPG up to 10MB</p>
              </div>
              {preview && (
                <div className="img-preview">
                  <img src={preview.url} alt="Preview" />
                </div>
              )}
            </div>

            <button
              className="btn btn-primary btn-lg w-full"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Creating listing...' : 'Publish listing'}
            </button>
          </form>
        </motion.div>
        <Footer />
      </div>
    </>
  );
}
