import React, { useState, useEffect } from 'react';
import { useUploadImagesMutation, useGetUploadedImagesQuery, useEditImageMutation, useDeleteImageMutation,useUpdateImageOrderMutation } from '../slices/usersApiSlice';
import { Row, Col, Container, Button, Form, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify'; 

const HomeScreen = () => {
  const [uploadedImagesState, setUploadedImagesState] = useState([]);
  const [newImages, setNewImages] = useState([]);  const [titles, setTitles] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editImageDetails, setEditImageDetails] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [uploadImages] = useUploadImagesMutation();
  const [editImage] = useEditImageMutation();
  const [deleteImage] = useDeleteImageMutation();
  const [updateImageOrder] = useUpdateImageOrderMutation(); 

  const { data: uploadedImages, isLoading, isError, refetch } = useGetUploadedImagesQuery();

  const handleImageChange = (e) => {
    setNewImages([...e.target.files]); 
    };

  const handleTitleChange = (e, index) => {
    const newTitles = [...titles];
    newTitles[index] = e.target.value;
    setTitles(newTitles);
  };

  const handleUpload = async () => {
    const formData = new FormData();

    newImages.forEach((image, index) => {
      formData.append('images', image);
      formData.append('titles', titles[index] || '');
    });

    try {
      await uploadImages(formData);
      toast.success('Images uploaded successfully');  // Success toast
      refetch();
    } catch (error) {
      console.error('Error uploading images:', error);
      if (error?.data?.message) {
        toast.error(error.data.message);  // Show error toast from server response
      } else {
        toast.error('Error uploading images. Please try again.');
      }
    }
  };

  const handleEdit = (image) => {
    setEditImageDetails(image);
    setNewTitle(image.title);
    setNewImage(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (editImageDetails) {
      const formData = new FormData();
      formData.append('id', editImageDetails._id);
      formData.append('title', newTitle);
      if (newImage) {
        formData.append('image', newImage);
      }

      try {
        await editImage(formData);
        console.log('Image updated successfully');
        setShowEditModal(false);
        refetch();
      } catch (error) {
        console.error('Error updating image:', error);
      }
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await deleteImage(imageId);
      console.log('Image deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source } = result;
  
    if (!destination) return;
    if (destination.index === source.index) return;
  
    const reorderedImages = Array.from(uploadedImages.images);
    const [movedImage] = reorderedImages.splice(source.index, 1);
    reorderedImages.splice(destination.index, 0, movedImage);
  
    
  
    setUploadedImagesState(reorderedImages);
    const imageOrder = reorderedImages.map((img) => img._id); 
  
    try {
      await updateImageOrder({ newImageOrder: imageOrder }); 
      console.log('Images reordered successfully');
      refetch();
    } catch (error) {
      console.error('Error reordering images:', error);
    }
  };
  useEffect(() => {
    if (uploadedImages && uploadedImages.images) {
      setUploadedImagesState(uploadedImages.images); 
    }
  }, [uploadedImages]);
  

  useEffect(() => {
    refetch(); 
  }, [refetch]);

  return (
    <Container>
      <Button 
        onClick={() => setShowUploadForm(!showUploadForm)} 
        className="mb-3"
      >
        Upload Image
      </Button>

      {showUploadForm && (
        <div>
          <input type="file" multiple onChange={handleImageChange} />
          {newImages.map((image, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Enter title"
                className='my-3'
                onChange={(e) => handleTitleChange(e, index)}
              />
            </div>
          ))}
          <Button onClick={handleUpload}>Upload</Button>
        </div>
      )}

      <h2>Images</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p>Error loading images</p>
      ) : (
      <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="images">
        {(provided) => (
          <Row {...provided.droppableProps} ref={provided.innerRef}>
          {uploadedImagesState?.map((image, index) => (
            <Draggable key={image._id.toString()} draggableId={image._id.toString()} index={index}>
              {(provided) => (
                <Col 
                  sm={12} md={6} lg={4} xl={3} 
                  className="mb-4"
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps} 
                >
                  <div className="image-container">
                    <img src={`https://stock-image-platform.onrender.com/uploads/${image.fileName}`} alt={image.title} />
                  </div>
                  <div style={{display: "flex", justifyContent: "space-between"}}>
                    <p>{image.title}</p>
                    <div>
                      <Button variant="link" onClick={() => handleEdit(image)}>
                        <FaEdit /> 
                      </Button>
                      <Button variant="link" onClick={() => handleDelete(image._id)}>
                        <FaTrash /> 
                      </Button>
                    </div>
                  </div>
                </Col>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </Row>
        
        )}
      </Droppable>
    </DragDropContext>
  )}


      {editImageDetails && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Image</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img
              src={`https://stock-image-platform.onrender.com/uploads/${editImageDetails.fileName}`}
              alt={editImageDetails.title}
              style={{ width: '100%', marginBottom: '15px' }}
            />
            <Form>
              <Form.Group controlId="formTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formImage">
                <Form.Label>Change Image</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setNewImage(e.target.files[0])}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default HomeScreen;
