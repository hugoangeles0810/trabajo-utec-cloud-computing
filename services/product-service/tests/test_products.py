import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Product, Vendor, Category
from app.schemas.product import ProductCreate


class TestProducts:
    """Test product endpoints"""
    
    def test_create_product(self, client: TestClient, db_session: Session, sample_vendor_data, sample_category_data, sample_product_data):
        """Test creating a product"""
        # Create vendor first
        vendor_response = client.post("/api/v1/vendors/", json=sample_vendor_data)
        assert vendor_response.status_code == 201
        vendor_id = vendor_response.json()["id"]
        
        # Create category
        category_response = client.post("/api/v1/categories/", json=sample_category_data)
        assert category_response.status_code == 201
        category_id = category_response.json()["id"]
        
        # Create product
        product_data = sample_product_data.copy()
        product_data["vendor_id"] = vendor_id
        product_data["category_ids"] = [category_id]
        
        response = client.post("/api/v1/products/", json=product_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == product_data["name"]
        assert data["sku"] == product_data["sku"]
        assert data["vendor_id"] == vendor_id
        assert len(data["categories"]) == 1
        assert data["categories"][0]["id"] == category_id
    
    def test_get_products(self, client: TestClient, db_session: Session):
        """Test getting products list"""
        response = client.get("/api/v1/products/")
        assert response.status_code == 200
        
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "size" in data
    
    def test_get_product_by_id(self, client: TestClient, db_session: Session, sample_vendor_data, sample_product_data):
        """Test getting a product by ID"""
        # Create vendor
        vendor_response = client.post("/api/v1/vendors/", json=sample_vendor_data)
        vendor_id = vendor_response.json()["id"]
        
        # Create product
        product_data = sample_product_data.copy()
        product_data["vendor_id"] = vendor_id
        
        product_response = client.post("/api/v1/products/", json=product_data)
        product_id = product_response.json()["id"]
        
        # Get product by ID
        response = client.get(f"/api/v1/products/{product_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == product_id
        assert data["name"] == product_data["name"]
    
    def test_get_product_by_sku(self, client: TestClient, db_session: Session, sample_vendor_data, sample_product_data):
        """Test getting a product by SKU"""
        # Create vendor
        vendor_response = client.post("/api/v1/vendors/", json=sample_vendor_data)
        vendor_id = vendor_response.json()["id"]
        
        # Create product
        product_data = sample_product_data.copy()
        product_data["vendor_id"] = vendor_id
        
        product_response = client.post("/api/v1/products/", json=product_data)
        sku = product_response.json()["sku"]
        
        # Get product by SKU
        response = client.get(f"/api/v1/products/sku/{sku}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["sku"] == sku
    
    def test_update_product(self, client: TestClient, db_session: Session, sample_vendor_data, sample_product_data):
        """Test updating a product"""
        # Create vendor
        vendor_response = client.post("/api/v1/vendors/", json=sample_vendor_data)
        vendor_id = vendor_response.json()["id"]
        
        # Create product
        product_data = sample_product_data.copy()
        product_data["vendor_id"] = vendor_id
        
        product_response = client.post("/api/v1/products/", json=product_data)
        product_id = product_response.json()["id"]
        
        # Update product
        update_data = {"name": "Updated Product Name", "price": 149.99}
        response = client.put(f"/api/v1/products/{product_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["price"] == update_data["price"]
    
    def test_delete_product(self, client: TestClient, db_session: Session, sample_vendor_data, sample_product_data):
        """Test deleting a product"""
        # Create vendor
        vendor_response = client.post("/api/v1/vendors/", json=sample_vendor_data)
        vendor_id = vendor_response.json()["id"]
        
        # Create product
        product_data = sample_product_data.copy()
        product_data["vendor_id"] = vendor_id
        
        product_response = client.post("/api/v1/products/", json=product_data)
        product_id = product_response.json()["id"]
        
        # Delete product
        response = client.delete(f"/api/v1/products/{product_id}")
        assert response.status_code == 200
        
        # Verify product is deleted
        get_response = client.get(f"/api/v1/products/{product_id}")
        assert get_response.status_code == 404
    
    def test_search_products(self, client: TestClient, db_session: Session, sample_vendor_data, sample_product_data):
        """Test searching products"""
        # Create vendor
        vendor_response = client.post("/api/v1/vendors/", json=sample_vendor_data)
        vendor_id = vendor_response.json()["id"]
        
        # Create product
        product_data = sample_product_data.copy()
        product_data["vendor_id"] = vendor_id
        
        product_response = client.post("/api/v1/products/", json=product_data)
        
        # Search products
        response = client.get("/api/v1/products/?query=test")
        assert response.status_code == 200
        
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 1
    
    def test_get_featured_products(self, client: TestClient, db_session: Session):
        """Test getting featured products"""
        response = client.get("/api/v1/products/featured")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_update_inventory(self, client: TestClient, db_session: Session, sample_vendor_data, sample_product_data):
        """Test updating product inventory"""
        # Create vendor
        vendor_response = client.post("/api/v1/vendors/", json=sample_vendor_data)
        vendor_id = vendor_response.json()["id"]
        
        # Create product
        product_data = sample_product_data.copy()
        product_data["vendor_id"] = vendor_id
        
        product_response = client.post("/api/v1/products/", json=product_data)
        product_id = product_response.json()["id"]
        
        # Update inventory
        response = client.patch(f"/api/v1/products/{product_id}/inventory?quantity=25")
        assert response.status_code == 200
        
        data = response.json()
        assert data["inventory_quantity"] == 25
