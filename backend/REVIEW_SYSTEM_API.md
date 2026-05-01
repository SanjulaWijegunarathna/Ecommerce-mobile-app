# Review System with Image Support - API Documentation

## Overview
Updated review system now supports:
- ✅ Image uploads with reviews
- ✅ MongoDB storage (base64 encoded)
- ✅ User review submission with images
- ✅ Admin review verification/approval
- ✅ Public review viewing
- ✅ Fixed review deletion

## API Endpoints

### Review Endpoints (Base: /api/reviews)

#### 1. Get Product Reviews (PUBLIC)
```
GET /api/reviews/product/:productId
```
Returns all reviews for a specific product with user details and images.

**Response:**
```json
[
  {
    "_id": "review-id",
    "user": { "name": "John", "email": "john@example.com", "profileImage": "" },
    "product": "product-id",
    "rating": 5,
    "comment": "Great product!",
    "images": [
      {
        "filename": "review-xyz.jpg",
        "data": "base64-encoded-image-data",
        "uploadedAt": "2026-04-30T12:00:00Z"
      }
    ],
    "isVerified": true,
    "createdAt": "2026-04-30T12:00:00Z"
  }
]
```

#### 2. Submit Review with Images (PROTECTED)
```
POST /api/reviews/:productId
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "rating": 5,
  "comment": "Excellent quality!",
  "images": [
    {
      "filename": "review-image-1.jpg",
      "data": "base64-encoded-string...",
      "size": 102400
    }
  ]
}
```

**Response:** Full review object with ID

#### 3. Update Review (PROTECTED - Own Review Only)
```
PUT /api/reviews/:reviewId
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "rating": 4,
  "comment": "Updated comment",
  "images": [...]  // Optional - replaces existing images
}
```

#### 4. Add Images to Existing Review (PROTECTED - Own Review Only)
```
PUT /api/reviews/:reviewId/images
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "images": [
    {
      "filename": "new-image.jpg",
      "data": "base64-encoded-string...",
      "size": 102400
    }
  ]
}
```

**Response:** Updated review with all images

#### 5. Delete Review (PROTECTED - Own Review or Admin)
```
DELETE /api/reviews/:reviewId
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{ "message": "Review removed successfully" }
```

#### 6. Verify Review (ADMIN ONLY)
```
PUT /api/reviews/:reviewId/verify
Headers: Authorization: Bearer {token}
```

**Response:** Verified review object with isVerified: true

#### 7. Get All Reviews (ADMIN ONLY)
```
GET /api/reviews/admin/all
Headers: Authorization: Bearer {token}
```

Returns all reviews across all products for admin dashboard.

---

## File Upload Endpoint

### Upload Review Images
```
POST /api/upload/reviews
Headers: multipart/form-data
Body: FormData with multiple 'images' files (max 5)

Example JavaScript:
const formData = new FormData();
formData.append('images', imageFile1);
formData.append('images', imageFile2);

const response = await fetch(`${API_BASE}/api/upload/reviews`, {
  method: 'POST',
  body: formData,
  headers: { Authorization: `Bearer ${token}` }
});
```

**Response:**
```json
{
  "images": [
    {
      "filename": "images-1714489200000.jpg",
      "path": "/uploads/images-1714489200000.jpg",
      "size": 102400
    }
  ]
}
```

---

## Database Schema

### Review Model
```
{
  user: ObjectId (ref: User),
  product: ObjectId (ref: Inventory),
  name: String,
  rating: Number (1-5),
  comment: String,
  images: [
    {
      filename: String,
      data: String (base64 encoded),
      size: Number,
      uploadedAt: Date
    }
  ],
  isVerified: Boolean (default: false),
  timestamps: true
}
```

---

## Frontend Integration

### Submitting a Review with Images

```javascript
// 1. Capture images from user (using expo-image-picker)
import * as ImagePicker from 'expo-image-picker';

const pickImages = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    base64: true,
    aspect: [4, 3],
    quality: 0.8
  });

  if (!result.canceled) {
    const base64Images = result.assets.map(asset => ({
      filename: asset.fileName || 'image.jpg',
      data: `data:image/jpeg;base64,${asset.base64}`,
      size: asset.fileSize || 0
    }));
    return base64Images;
  }
};

// 2. Submit review with images
const submitReview = async (rating, comment, images) => {
  const response = await fetch(`${API_BASE}/api/reviews/${productId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`
    },
    body: JSON.stringify({
      rating,
      comment,
      images  // Array of base64 image objects
    })
  });

  return response.json();
};
```

### Viewing Reviews with Images

```javascript
const fetchReviews = async () => {
  const response = await fetch(`${API_BASE}/api/reviews/product/${productId}`);
  const reviews = await response.json();
  
  // Reviews now include images array
  reviews.forEach(review => {
    console.log('Review:', review.comment);
    review.images?.forEach(img => {
      // Display image using: <Image source={{ uri: img.data }} />
    });
  });
};
```

---

## Fixed Issues

✅ **Issue 1: Password Hashing** - Fixed by using `User.create()` instead of `insertMany()` to trigger pre-save middleware

✅ **Issue 2: API Endpoint** - Updated from hardcoded IP to `localhost:5000`

✅ **Issue 3: Review Deletion** - Fixed by:
   - Using `findByIdAndDelete()` instead of `deleteOne()`
   - Allowing both review owner and admin to delete
   - Proper error handling

✅ **Issue 4: Image Storage** - Implemented base64 encoding for MongoDB storage, no external file system needed

✅ **Issue 5: Public Review Viewing** - Made `/api/reviews/product/:id` public (no authentication required)

✅ **Issue 6: Admin Verification** - Added `isVerified` field to reviews for admin approval workflow
