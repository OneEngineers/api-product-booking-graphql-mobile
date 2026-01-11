// Mock test data and utilities
export const mockProductData = {
  id: '1',
  name: 'Test Product',
  description: 'This is a test product',
  price: 99.99,
  image: 'https://example.com/image.jpg',
};

export const mockUserData = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
};

export const mockApiResponse = {
  success: true,
  data: mockProductData,
  message: 'Success',
};

export const mockErrorResponse = {
  success: false,
  error: 'Test error message',
  code: 'TEST_ERROR',
};

export const historyLog = [
  {
    action: 'CREATE',
    entity: 'Product',
    entityId: '1',
    timestamp: new Date(),
    userId: 'user-1',
  },
  {
    action: 'UPDATE',
    entity: 'Product',
    entityId: '1',
    timestamp: new Date(),
    userId: 'user-1',
  },
];  