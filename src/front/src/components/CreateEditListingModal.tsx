import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import type { Listing, CreateListingData, UpdateListingData } from '../interface/Listings';

interface CreateEditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateListingData | UpdateListingData) => Promise<boolean>; 
  listing?: Listing | null;
  currentUserId?: number;
  currentUserName?: string;
}

export function CreateEditListingModal({
  isOpen,
  onClose,
  onSubmit,
  listing,
  currentUserId,
  currentUserName
}: CreateEditListingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deposit: '',
    period: 'день',
    category: '',
    available: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title,
        description: listing.description,
        price: listing.price.toString(),
        deposit: listing.deposit.toString(),
        period: listing.period,
        category: listing.category,
        available: listing.available
      });
    } else {
      setFormData({
        title: '',
        description: '',
        price: '',
        deposit: '',
        period: 'день',
        category: '',
        available: true
      });
    }
    setErrors({});
    setIsSubmitting(false);
  }, [listing, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    }

    if (!formData.price || parseInt(formData.price) <= 0) {
      newErrors.price = 'Цена должна быть больше 0';
    }

    if (!formData.deposit || parseInt(formData.deposit) < 0) {
      newErrors.deposit = 'Залог не может быть отрицательным';
    }

    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!currentUserId || !currentUserName) {
      setErrors({ general: 'Необходимо войти в систему' });
      return;
    }

    setIsSubmitting(true);

    const submitData: any = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: parseInt(formData.price),
      deposit: parseInt(formData.deposit),
      period: formData.period,
      category: formData.category,
      available: formData.available
    };

    // Для создания добавляем данные владельца
    if (!listing) {
      submitData.owner_id = currentUserId;
      submitData.owner_name = currentUserName;
    }

    const success = await onSubmit(submitData);
    
    if (!success) {
      setErrors({ general: 'Ошибка при сохранении объявления. Попробуйте еще раз.' });
    }
    
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {listing ? 'Редактировать объявление' : 'Создать объявление'}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errors.general && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
              {errors.general}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Название <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Например: Дрель мощная Bosch"
              className={errors.title ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Опишите ваш инструмент, его состояние, особенности..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Цена (₽) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0"
                min="0"
                className={errors.price ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Залог (₽) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                placeholder="0"
                min="0"
                className={errors.deposit ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.deposit && (
                <p className="text-red-500 text-xs mt-1">{errors.deposit}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Период <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({...formData, period: e.target.value})}
                className="w-full p-2 border rounded-md"
                disabled={isSubmitting}
              >
                <option value="день">День</option>
                <option value="неделя">Неделя</option>
                <option value="месяц">Месяц</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Категория <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className={`w-full p-2 border rounded-md ${errors.category ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              >
                <option value="">Выберите категорию</option>
                <option value="Электроника">Электроника</option>
                <option value="Инструменты">Инструменты</option>
                <option value="Строительство">Оборудования</option>
                <option value="Другое">Другое</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({...formData, available: e.target.checked})}
              className="rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="available" className="text-sm">
              Доступно для аренды
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : (listing ? 'Сохранить' : 'Создать')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}