"""
Module 10 Phase 2A — Product Purchase Tracking Endpoints
Endpoints for tracking product purchases and calculating replenishment dates.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import Optional

from app.database import get_db
from app import models
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/products/purchases",
    tags=["Product Purchases"]
)


@router.post("")
def create_product_purchase(
    product_id: str,
    product_name: str,
    purchase_date: date,
    quantity: int,
    estimated_replenishment_date: Optional[date] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log a product purchase for the authenticated user.
    
    Parameters:
    - product_id: External product identifier (e.g., from product database)
    - product_name: Human-readable product name
    - purchase_date: Date of purchase (YYYY-MM-DD)
    - quantity: Number of units purchased
    - estimated_replenishment_date: Optional date when product may need replenishment
    """
    try:
        # Validate quantity
        if quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be positive"
            )
        
        # Create purchase record
        purchase = models.ProductPurchase(
            user_id=current_user.id,
            product_id=product_id,
            product_name=product_name,
            purchase_date=purchase_date,
            quantity=quantity,
            estimated_replenishment_date=estimated_replenishment_date
        )
        db.add(purchase)
        db.commit()
        db.refresh(purchase)
        
        return {
            "status": "success",
            "message": "Product purchase logged",
            "purchase": {
                "id": purchase.id,
                "product_id": purchase.product_id,
                "product_name": purchase.product_name,
                "purchase_date": purchase.purchase_date.isoformat(),
                "quantity": purchase.quantity,
                "estimated_replenishment_date": purchase.estimated_replenishment_date.isoformat() if purchase.estimated_replenishment_date else None,
                "created_at": purchase.created_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create product purchase: {str(e)}"
        )


@router.get("")
def get_product_purchases(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(30, ge=1, le=365),
    offset: int = Query(0, ge=0),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get paginated product purchase history for the authenticated user.
    
    Parameters:
    - start_date: Optional start date filter (YYYY-MM-DD)
    - end_date: Optional end date filter (YYYY-MM-DD)
    - limit: Max purchases per page (1-365, default 30)
    - offset: Pagination offset
    """
    try:
        query = db.query(models.ProductPurchase).filter(
            models.ProductPurchase.user_id == current_user.id
        )
        
        if start_date:
            query = query.filter(models.ProductPurchase.purchase_date >= start_date)
        if end_date:
            query = query.filter(models.ProductPurchase.purchase_date <= end_date)
        
        total = query.count()
        purchases = query.order_by(models.ProductPurchase.purchase_date.desc()).offset(offset).limit(limit).all()
        
        return {
            "status": "success",
            "total": total,
            "limit": limit,
            "offset": offset,
            "purchases": [
                {
                    "id": p.id,
                    "product_id": p.product_id,
                    "product_name": p.product_name,
                    "purchase_date": p.purchase_date.isoformat(),
                    "quantity": p.quantity,
                    "estimated_replenishment_date": p.estimated_replenishment_date.isoformat() if p.estimated_replenishment_date else None,
                    "actual_replenishment_date": p.actual_replenishment_date.isoformat() if p.actual_replenishment_date else None,
                    "created_at": p.created_at.isoformat()
                }
                for p in purchases
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve product purchases: {str(e)}"
        )


@router.get("/{purchase_id}")
def get_product_purchase(
    purchase_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single product purchase record (must belong to authenticated user).
    """
    try:
        purchase = db.query(models.ProductPurchase).filter(
            models.ProductPurchase.id == purchase_id,
            models.ProductPurchase.user_id == current_user.id
        ).first()
        
        if not purchase:
            raise HTTPException(
                status_code=404,
                detail="Product purchase not found"
            )
        
        return {
            "status": "success",
            "purchase": {
                "id": purchase.id,
                "product_id": purchase.product_id,
                "product_name": purchase.product_name,
                "purchase_date": purchase.purchase_date.isoformat(),
                "quantity": purchase.quantity,
                "estimated_replenishment_date": purchase.estimated_replenishment_date.isoformat() if purchase.estimated_replenishment_date else None,
                "actual_replenishment_date": purchase.actual_replenishment_date.isoformat() if purchase.actual_replenishment_date else None,
                "created_at": purchase.created_at.isoformat(),
                "updated_at": purchase.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve product purchase: {str(e)}"
        )


@router.put("/{purchase_id}")
def update_product_purchase(
    purchase_id: int,
    estimated_replenishment_date: Optional[date] = None,
    actual_replenishment_date: Optional[date] = None,
    quantity: Optional[int] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a product purchase record (must belong to authenticated user).
    """
    try:
        purchase = db.query(models.ProductPurchase).filter(
            models.ProductPurchase.id == purchase_id,
            models.ProductPurchase.user_id == current_user.id
        ).first()
        
        if not purchase:
            raise HTTPException(
                status_code=404,
                detail="Product purchase not found"
            )
        
        # Validate quantity if provided
        if quantity is not None:
            if quantity <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Quantity must be positive"
                )
            purchase.quantity = quantity
        
        if estimated_replenishment_date is not None:
            purchase.estimated_replenishment_date = estimated_replenishment_date
        
        if actual_replenishment_date is not None:
            purchase.actual_replenishment_date = actual_replenishment_date
        
        db.commit()
        db.refresh(purchase)
        
        return {
            "status": "success",
            "message": "Product purchase updated",
            "purchase": {
                "id": purchase.id,
                "product_id": purchase.product_id,
                "product_name": purchase.product_name,
                "purchase_date": purchase.purchase_date.isoformat(),
                "quantity": purchase.quantity,
                "estimated_replenishment_date": purchase.estimated_replenishment_date.isoformat() if purchase.estimated_replenishment_date else None,
                "actual_replenishment_date": purchase.actual_replenishment_date.isoformat() if purchase.actual_replenishment_date else None,
                "created_at": purchase.created_at.isoformat(),
                "updated_at": purchase.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update product purchase: {str(e)}"
        )


@router.delete("/{purchase_id}")
def delete_product_purchase(
    purchase_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a product purchase record (must belong to authenticated user).
    """
    try:
        purchase = db.query(models.ProductPurchase).filter(
            models.ProductPurchase.id == purchase_id,
            models.ProductPurchase.user_id == current_user.id
        ).first()
        
        if not purchase:
            raise HTTPException(
                status_code=404,
                detail="Product purchase not found"
            )
        
        db.delete(purchase)
        db.commit()
        
        return {
            "status": "success",
            "message": "Product purchase deleted"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete product purchase: {str(e)}"
        )


@router.get("/replenishment/due")
def get_replenishment_due(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get products that are due or overdue for replenishment.
    Uses estimated_replenishment_date and product_reminder_days_before preference.
    """
    try:
        # Get user's reminder preference
        prefs = db.query(models.NotificationPreference).filter(
            models.NotificationPreference.user_id == current_user.id
        ).first()
        
        reminder_days_before = 7  # Default
        if prefs:
            reminder_days_before = prefs.product_reminder_days_before
        
        # Calculate reminder window
        today = date.today()
        reminder_start_date = today - timedelta(days=365)  # Don't look back more than a year
        reminder_end_date = today + timedelta(days=reminder_days_before)
        
        # Find purchases with replenishment dates in the reminder window
        purchases = db.query(models.ProductPurchase).filter(
            models.ProductPurchase.user_id == current_user.id,
            models.ProductPurchase.estimated_replenishment_date.isnot(None),
            models.ProductPurchase.actual_replenishment_date.is_(None),  # Not yet replenished
            models.ProductPurchase.estimated_replenishment_date <= reminder_end_date,
            models.ProductPurchase.estimated_replenishment_date >= reminder_start_date
        ).order_by(models.ProductPurchase.estimated_replenishment_date.asc()).all()
        
        # Categorize by urgency
        overdue = []
        due_soon = []
        
        for p in purchases:
            if p.estimated_replenishment_date <= today:
                overdue.append({
                    "id": p.id,
                    "product_id": p.product_id,
                    "product_name": p.product_name,
                    "purchase_date": p.purchase_date.isoformat(),
                    "quantity": p.quantity,
                    "estimated_replenishment_date": p.estimated_replenishment_date.isoformat(),
                    "days_overdue": (today - p.estimated_replenishment_date).days,
                    "urgency": "overdue"
                })
            else:
                due_soon.append({
                    "id": p.id,
                    "product_id": p.product_id,
                    "product_name": p.product_name,
                    "purchase_date": p.purchase_date.isoformat(),
                    "quantity": p.quantity,
                    "estimated_replenishment_date": p.estimated_replenishment_date.isoformat(),
                    "days_until_due": (p.estimated_replenishment_date - today).days,
                    "urgency": "due_soon"
                })
        
        return {
            "status": "success",
            "reminder_window_days": reminder_days_before,
            "overdue_count": len(overdue),
            "due_soon_count": len(due_soon),
            "overdue": overdue,
            "due_soon": due_soon
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve replenishment data: {str(e)}"
        )
