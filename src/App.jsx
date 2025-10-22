// import React, { useState, useEffect } from 'react';
// import { ShoppingCart, Trash2 } from 'lucide-react';

// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// class SupabaseClient {
//   constructor(url, key) {
//     this.url = url;
//     this.key = key;
//   }

//   async request(path, options = {}) {
//     const response = await fetch(`${this.url}${path}`, {
//       ...options,
//       headers: {
//         'apikey': this.key,
//         'Authorization': `Bearer ${this.key}`,
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//     });
    
//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Request failed');
//     }
    
//     return response.json();
//   }

//   from(table) {
//     return {
//       select: async (columns = '*') => {
//         const data = await this.request(`/rest/v1/${table}?select=${columns}&order=id.desc`);
//         return { data, error: null };
//       },
//       insert: async (values) => {
//         const data = await this.request(`/rest/v1/${table}`, {
//           method: 'POST',
//           body: JSON.stringify(values),
//         });
//         return { data, error: null };
//       }
//     };
//   }

//   storage = {
//     from: (bucket) => ({
//       upload: async (path, file) => {
//         const formData = new FormData();
//         formData.append('', file);
        
//         const response = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
//           method: 'POST',
//           headers: {
//             'apikey': this.key,
//             'Authorization': `Bearer ${this.key}`,
//           },
//           body: formData,
//         });
        
//         if (!response.ok) {
//           const error = await response.json();
//           return { data: null, error };
//         }
        
//         const data = await response.json();
//         return { data, error: null };
//       },
//       getPublicUrl: (path) => {
//         return {
//           data: {
//             publicUrl: `${this.url}/storage/v1/object/public/${bucket}/${path}`
//           }
//         };
//       }
//     })
//   };
// }

// const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// const CustomerApp = () => {
//   const [menuItems, setMenuItems] = useState([]);
//   const [isShopOpen, setIsShopOpen] = useState(null);
//   const [cart, setCart] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [itemSize, setItemSize] = useState('normal');
//   const [itemAddEgg, setItemAddEgg] = useState('none');
//   const [itemNote, setItemNote] = useState('');
//   const [orderNote, setOrderNote] = useState('');
//   const [customerPhone, setCustomerPhone] = useState('');
//   const [slip, setSlip] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState('menu');
//   const [lineUserId, setLineUserId] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('online');

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const userId = urlParams.get('lineUserId');
//     if (userId) {
//       setLineUserId(userId);
//       console.log('LINE User ID detected:', userId);
//     }
//     loadShopStatus();
//     loadMenuItems();
//   }, []);

//   const loadShopStatus = async () => {
//     try {
//       const { data, error } = await supabase.from('shop_settings').select('*');
//       if (error) throw error;
      
//       if (data && data.length > 0) {
//         setIsShopOpen(data[0].is_open);
//       } else {
//         setIsShopOpen(true);
//       }
//     } catch (error) {
//       console.error('Error loading shop status:', error);
//       setIsShopOpen(true);
//     }
//   };

//   const loadMenuItems = async () => {
//     try {
//       const { data, error } = await supabase.from('menu_items').select('*');
//       if (error) throw error;
//       setMenuItems(data.filter(item => item.is_active) || []);
//     } catch (error) {
//       console.error('Error loading menu:', error);
//       alert('ไม่สามารถโหลดเมนูได้ กรุณาลองใหม่อีกครั้ง');
//     }
//   };

//   const categories = ['ทั้งหมด', ...new Set(menuItems.map(item => item.category))];
//   const filteredMenu = selectedCategory === 'ทั้งหมด' 
//     ? menuItems 
//     : menuItems.filter(item => item.category === selectedCategory);

//   const addItemFromModal = () => {
//     if (!selectedItem) return;
    
//     const price = itemSize === 'normal' ? selectedItem.price_normal : selectedItem.price_special;
//     let totalPrice = price;
//     let itemName = selectedItem.name + ` (${itemSize === 'normal' ? 'ธรรมดา' : 'พิเศษ'})`;
    
//     if (itemAddEgg === 'fried') {
//       totalPrice += 10;
//       itemName += ' + ไข่เจียว';
//     } else if (itemAddEgg === 'sunny') {
//       totalPrice += 10;
//       itemName += ' + ไข่ดาว';
//     }
    
//     const cartItem = {
//       id: selectedItem.id,
//       cartId: `${selectedItem.id}-${itemSize}-${itemAddEgg}-${Date.now()}`,
//       name: itemName,
//       originalName: selectedItem.name,
//       size: itemSize,
//       addEgg: itemAddEgg,
//       itemNote: itemNote,
//       price: totalPrice,
//       quantity: 1
//     };

//     setCart([...cart, cartItem]);
//     setSelectedItem(null);
//     setItemSize('normal');
//     setItemAddEgg('none');
//     setItemNote('');
//   };

//   const removeFromCart = (cartId) => {
//     setCart(cart.filter(i => i.cartId !== cartId));
//   };

//   const updateQuantity = (cartId, change) => {
//     setCart(cart.map(i => {
//       if (i.cartId === cartId) {
//         const newQuantity = i.quantity + change;
//         return newQuantity > 0 ? { ...i, quantity: newQuantity } : i;
//       }
//       return i;
//     }).filter(i => i.quantity > 0));
//   };

//   const getTotalPrice = () => {
//     return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//   };

//   const uploadSlip = async (file) => {
//     try {
//       const fileExt = file.name.split('.').pop();
//       const fileName = `${Date.now()}.${fileExt}`;
      
//       const { data, error } = await supabase.storage
//         .from('slips')
//         .upload(fileName, file);

//       if (error) throw error;

//       const { data: { publicUrl } } = supabase.storage
//         .from('slips')
//         .getPublicUrl(fileName);

//       return publicUrl;
//     } catch (error) {
//       console.error('Error uploading slip:', error);
//       return new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.readAsDataURL(file);
//       });
//     }
//   };

//   const handleSlipUpload = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setLoading(true);
//       const url = await uploadSlip(file);
//       setSlip(url);
//       setLoading(false);
//     }
//   };

//   const submitOrder = async () => {
//     if (cart.length === 0) {
//       alert('กรุณาเลือกเมนูอาหาร');
//       return;
//     }
//     if (paymentMethod === 'online' && !slip) {
//       alert('กรุณาแนบสลิปการชำระเงิน');
//       return;
//     }

//     setLoading(true);
//     try {
//       const { data, error } = await supabase.from('orders').insert([{
//         items: cart,
//         note: orderNote,
//         slip_url: paymentMethod === 'online' ? slip : null,
//         total: getTotalPrice(),
//         customer_phone: customerPhone,
//         line_user_id: lineUserId || null,
//         payment_method: paymentMethod,
//         status: 'pending'
//       }]);

//       if (error) throw error;

//       const successMessage = lineUserId 
//         ? 'สั่งอาหารสำเร็จ! 🎉\n\nเราจะแจ้งเตือนสถานะออเดอร์ผ่าน LINE ของคุณ\nกรุณารอการยืนยันจากร้านค้า'
//         : 'สั่งอาหารสำเร็จ! 🎉\nกรุณารอการยืนยันจากร้านค้า';
      
//       alert(successMessage);
//       setCart([]);
//       setCustomerPhone('');
//       setOrderNote('');
//       setSlip(null);
//       setPaymentMethod('online');
//       setCurrentPage('menu');
//     } catch (error) {
//       console.error('Error submitting order:', error);
//       alert('เกิดข้อผิดพลาด: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (isShopOpen === null) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-xl text-gray-600">กำลังโหลด...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isShopOpen) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
//           <div className="text-6xl mb-4">🔴</div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">ร้านปิด</h1>
//           <p className="text-gray-600 mb-6">ขออภัยค่ะ ร้านอาหารปัจจุบันปิดอยู่</p>
//           <p className="text-gray-500">กรุณากลับมาใหม่ในช่วงเวลาที่ร้านเปิดค่ะ</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
//       <div className="container mx-auto px-4 py-6 max-w-6xl">
        
//         {currentPage === 'menu' && (
//           <>
//             <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 relative">
//               <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
//                 <span className="text-4xl">🍽️</span>
//                 ร้านอาหารตามสั่ง
//               </h1>
//               <p className="text-gray-600">เลือกเมนูที่คุณชอบและสั่งอาหารได้เลย</p>
              
//               {lineUserId && (
//                 <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
//                   <span>✅</span>
//                   <span>เชื่อมต่อ LINE แล้ว - รับการแจ้งเตือนสถานะออเดอร์</span>
//                 </div>
//               )}
              
//               {cart.length > 0 && (
//                 <button
//                   onClick={() => document.getElementById('cart-section').scrollIntoView({ behavior: 'smooth' })}
//                   className="absolute top-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all relative"
//                 >
//                   <ShoppingCart size={24} />
//                   <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
//                     {cart.reduce((sum, item) => sum + item.quantity, 0)}
//                   </span>
//                 </button>
//               )}
//             </div>

//             <div className="bg-white rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
//               <div className="flex gap-2 min-w-max">
//                 {categories.map(cat => (
//                   <button
//                     key={cat}
//                     onClick={() => setSelectedCategory(cat)}
//                     className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
//                       selectedCategory === cat
//                         ? 'bg-orange-500 text-white shadow-md'
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     {cat}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
//               {filteredMenu.map(item => (
//                 <div 
//                   key={item.id} 
//                   onClick={() => setSelectedItem(item)}
//                   className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden hover:scale-105"
//                 >
//                   <img 
//                     src={item.image} 
//                     alt={item.name}
//                     className="w-full h-32 object-cover bg-gray-200"
//                     onError={(e) => {
//                       e.target.src = '🍽️';
//                     }}
//                   />
//                   <div className="p-3">
//                     <h3 className="font-medium text-sm text-gray-800 line-clamp-2 min-h-[40px]">
//                       {item.name}
//                     </h3>
//                     <p className="text-xs text-gray-500 text-center mt-1">
//                       {item.price_normal}-{item.price_special}฿
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {selectedItem && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                 <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//                   <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
//                     <h2 className="text-xl font-bold text-gray-800">รายละเอียดเมนู</h2>
//                     <button 
//                       onClick={() => {
//                         setSelectedItem(null);
//                         setItemSize('normal');
//                         setItemAddEgg('none');
//                         setItemNote('');
//                       }}
//                       className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
//                     >
//                       ×
//                     </button>
//                   </div>
                  
//                   <div className="p-6">
//                     <img 
//                       src={selectedItem.image} 
//                       alt={selectedItem.name}
//                       className="w-full h-48 object-cover rounded-lg mb-4 bg-gray-200"
//                       onError={(e) => {
//                         e.target.style.display = 'none';
//                       }}
//                     />
//                     <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedItem.name}</h3>
//                     <p className="text-gray-500 text-center mb-6">{selectedItem.category}</p>
                    
//                     <div className="mb-6">
//                       <label className="block font-medium text-gray-700 mb-3">เลือกขนาด</label>
//                       <div className="grid grid-cols-2 gap-3">
//                         <button
//                           onClick={() => setItemSize('normal')}
//                           className={`py-3 px-4 rounded-lg font-medium transition-all ${
//                             itemSize === 'normal'
//                               ? 'bg-orange-500 text-white shadow-md'
//                               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                           }`}
//                         >
//                           ธรรมดา<br/>
//                           <span className="text-lg font-bold">{selectedItem.price_normal}฿</span>
//                         </button>
//                         <button
//                           onClick={() => setItemSize('special')}
//                           className={`py-3 px-4 rounded-lg font-medium transition-all ${
//                             itemSize === 'special'
//                               ? 'bg-red-500 text-white shadow-md'
//                               : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                           }`}
//                         >
//                           พิเศษ<br/>
//                           <span className="text-lg font-bold">{selectedItem.price_special}฿</span>
//                         </button>
//                       </div>
//                     </div>

//                     <div className="mb-6">
//                       <label className="block font-medium text-gray-700 mb-3">เพิ่มไข่ (+10฿)</label>
//                       <div className="grid grid-cols-3 gap-2">
//                         {['none', 'fried', 'sunny'].map((type) => (
//                           <button
//                             key={type}
//                             onClick={() => setItemAddEgg(type)}
//                             className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
//                               itemAddEgg === type
//                                 ? type === 'none' ? 'bg-gray-700 text-white' : 'bg-yellow-500 text-white'
//                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                             }`}
//                           >
//                             {type === 'none' ? 'ไม่เพิ่ม' : type === 'fried' ? 'ไข่เจียว' : 'ไข่ดาว'}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="mb-6">
//                       <label className="block font-medium text-gray-700 mb-2">หมายเหตุถึงร้านค้า</label>
//                       <textarea
//                         value={itemNote}
//                         onChange={(e) => setItemNote(e.target.value)}
//                         placeholder="เช่น ไม่ใส่ผักชี, เผ็ดน้อย..."
//                         className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                         rows="3"
//                       />
//                     </div>

//                     <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                       <div className="flex justify-between items-center">
//                         <span className="font-medium text-gray-700">ราคารวม</span>
//                         <span className="text-2xl font-bold text-orange-600">
//                           {(itemSize === 'normal' ? selectedItem.price_normal : selectedItem.price_special) + 
//                            (itemAddEgg !== 'none' ? 10 : 0)}฿
//                         </span>
//                       </div>
//                     </div>

//                     <button
//                       onClick={addItemFromModal}
//                       className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2"
//                     >
//                       <ShoppingCart size={20} />
//                       เพิ่มลงตะกร้า
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {cart.length > 0 && (
//               <div id="cart-section" className="bg-white rounded-xl shadow-xl p-6 mb-6">
//                 <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800">
//                   <ShoppingCart className="text-orange-500" />
//                   ตะกร้าของคุณ
//                 </h2>
                
//                 <div className="space-y-3 mb-4">
//                   {cart.map(item => (
//                     <div key={item.cartId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
//                       <div className="flex-1">
//                         <p className="font-medium text-gray-800">{item.name}</p>
//                         {item.itemNote && (
//                           <p className="text-xs text-gray-500 italic mt-1">หมายเหตุ: {item.itemNote}</p>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <div className="flex items-center gap-2 bg-white rounded-lg px-2">
//                           <button
//                             onClick={() => updateQuantity(item.cartId, -1)}
//                             className="text-orange-500 font-bold text-xl w-8 h-8 hover:bg-orange-50 rounded"
//                           >
//                             -
//                           </button>
//                           <span className="font-medium w-8 text-center">{item.quantity}</span>
//                           <button
//                             onClick={() => updateQuantity(item.cartId, 1)}
//                             className="text-orange-500 font-bold text-xl w-8 h-8 hover:bg-orange-50 rounded"
//                           >
//                             +
//                           </button>
//                         </div>
//                         <p className="font-bold text-orange-600 w-20 text-right">{item.price * item.quantity}฿</p>
//                         <button
//                           onClick={() => removeFromCart(item.cartId)}
//                           className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="border-t pt-4 mb-4">
//                   <div className="flex justify-between items-center text-xl font-bold text-gray-800">
//                     <span>ยอดรวม:</span>
//                     <span className="text-orange-600">{getTotalPrice()}฿</span>
//                   </div>
//                 </div>

//                 <div className="mb-4">
//                   <label className="block font-medium text-gray-700 mb-2">เบอร์โทรติดต่อ (ไม่บังคับ)</label>
//                   <input
//                     type="tel"
//                     value={customerPhone}
//                     onChange={(e) => setCustomerPhone(e.target.value)}
//                     placeholder="0812345678"
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="block font-medium text-gray-700 mb-2">หมายเหตุเพิ่มเติม (ไม่บังคับ)</label>
//                   <textarea
//                     value={orderNote}
//                     onChange={(e) => setOrderNote(e.target.value)}
//                     placeholder="หมายเหตุสำหรับคำสั่งซื้อทั้งหมด..."
//                     className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                     rows="3"
//                   />
//                 </div>

//                 <button
//                   onClick={() => setCurrentPage('payment')}
//                   className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-bold text-lg transition-all shadow-md"
//                 >
//                   ดำเนินการชำระเงิน
//                 </button>
//               </div>
//             )}
//           </>
//         )}

//         {currentPage === 'payment' && (
//           <div className="bg-white rounded-xl shadow-xl p-6">
//             <div className="flex items-center gap-3 mb-6">
//               <button
//                 onClick={() => setCurrentPage('menu')}
//                 className="text-gray-600 hover:text-gray-800"
//               >
//                 ← กลับ
//               </button>
//               <h2 className="text-2xl font-bold text-gray-800">ชำระเงิน</h2>
//             </div>

//             <div className="mb-6">
//               <h3 className="font-bold text-lg mb-3 text-gray-800">เลือกวิธีชำระเงิน</h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <button
//                   onClick={() => setPaymentMethod('online')}
//                   className={`p-4 rounded-xl border-2 transition-all ${
//                     paymentMethod === 'online'
//                       ? 'border-orange-500 bg-orange-50'
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   <div className="text-3xl mb-2">💳</div>
//                   <div className="font-bold text-gray-800">จ่ายเลย</div>
//                   <div className="text-xs text-gray-500 mt-1">โอนเงินผ่าน QR Code</div>
//                 </button>
//                 <button
//                   onClick={() => setPaymentMethod('cash')}
//                   className={`p-4 rounded-xl border-2 transition-all ${
//                     paymentMethod === 'cash'
//                       ? 'border-green-500 bg-green-50'
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   <div className="text-3xl mb-2">💵</div>
//                   <div className="font-bold text-gray-800">ชำระหน้าร้าน</div>
//                   <div className="text-xs text-gray-500 mt-1">จ่ายเงินสดตอนรับของ</div>
//                 </button>
//               </div>
//             </div>

//             <div className="bg-gray-50 rounded-lg p-4 mb-6">
//               <h3 className="font-bold text-lg mb-3 text-gray-800">สรุปรายการสั่งซื้อ</h3>
//               <div className="space-y-2 mb-3">
//                 {cart.map(item => (
//                   <div key={item.cartId} className="flex justify-between text-sm">
//                     <span className="text-gray-700">{item.name} x{item.quantity}</span>
//                     <span className="font-medium text-gray-800">{item.price * item.quantity}฿</span>
//                   </div>
//                 ))}
//               </div>
//               <div className="border-t pt-3">
//                 <div className="flex justify-between items-center">
//                   <span className="font-bold text-lg text-gray-800">ยอดรวมทั้งหมด:</span>
//                   <span className="text-2xl font-bold text-orange-600">{getTotalPrice()}฿</span>
//                 </div>
//               </div>
//             </div>

//             {lineUserId && (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
//                 <p className="text-green-800 text-sm flex items-center gap-2">
//                   <span>✅</span>
//                   <span>คุณจะได้รับการแจ้งเตือนสถานะออเดอร์ผ่าน LINE</span>
//                 </p>
//               </div>
//             )}

//             {paymentMethod === 'online' && (
//               <>
//                 <div className="bg-gray-50 p-6 rounded-lg text-center mb-6">
//                   <h3 className="font-bold text-lg mb-3 text-gray-800">สแกน QR Code เพื่อชำระเงิน</h3>
//                   <div className="bg-white p-4 rounded-lg inline-block">
//                     <img src="/Qr_code.JPG" alt="QR Code" className="w-48 h-48 mx-auto" />
//                     <p className="text-sm text-gray-500 mt-2">QR Code PromptPay</p>
//                     <p className="font-bold text-orange-600 text-xl mt-1">{getTotalPrice()}฿</p>
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <label className="block font-medium mb-2 text-gray-700">แนบสลิปการชำระเงิน *</label>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleSlipUpload}
//                     className="w-full border border-gray-300 rounded-lg p-2 mb-2"
//                     disabled={loading}
//                   />
//                   {slip && (
//                     <div className="mt-2 bg-gray-50 p-2 rounded-lg">
//                       <img src={slip} alt="สลิป" className="max-w-xs mx-auto rounded-lg shadow-md" />
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}

//             {paymentMethod === 'cash' && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//                 <h3 className="font-bold text-yellow-800 mb-2">📌 ข้อมูลสำคัญ</h3>
//                 <ul className="text-sm text-yellow-700 space-y-1">
//                   <li>• กรุณาเตรียมเงินพอดี {getTotalPrice()}฿</li>
//                   <li>• ชำระเงินสดตอนมารับอาหารที่ร้าน</li>
//                   <li>• รอการยืนยันออเดอร์จากร้านก่อนนะคะ</li>
//                 </ul>
//               </div>
//             )}

//             <button
//               onClick={submitOrder}
//               disabled={loading || (paymentMethod === 'online' && !slip)}
//               className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold text-lg transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               {loading ? 'กำลังส่งออเดอร์...' : 'ยืนยันการสั่งอาหาร'}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CustomerApp;
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.url}${path}`, {
      ...options,
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  }

  from(table) {
    return {
      select: async (columns = '*') => {
        const data = await this.request(`/rest/v1/${table}?select=${columns}&order=id.desc`);
        return { data, error: null };
      },
      insert: async (values) => {
        const data = await this.request(`/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(values),
        });
        return { data, error: null };
      }
    };
  }

  storage = {
    from: (bucket) => ({
      upload: async (path, file) => {
        const formData = new FormData();
        formData.append('', file);
        
        const response = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
          method: 'POST',
          headers: {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
          },
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          return { data: null, error };
        }
        
        const data = await response.json();
        return { data, error: null };
      },
      getPublicUrl: (path) => {
        return {
          data: {
            publicUrl: `${this.url}/storage/v1/object/public/${bucket}/${path}`
          }
        };
      }
    })
  };
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CustomerApp = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isShopOpen, setIsShopOpen] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemSize, setItemSize] = useState('normal');
  const [itemAddEgg, setItemAddEgg] = useState('none');
  const [itemNote, setItemNote] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('menu');
  const [lineUserId, setLineUserId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('lineUserId');
    if (userId) {
      setLineUserId(userId);
      console.log('LINE User ID detected:', userId);
    }
    loadShopStatus();
    loadMenuItems();
  }, []);

  const loadShopStatus = async () => {
    try {
      const { data, error } = await supabase.from('shop_settings').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        setIsShopOpen(data[0].is_open);
      } else {
        setIsShopOpen(true);
      }
    } catch (error) {
      console.error('Error loading shop status:', error);
      setIsShopOpen(true);
    }
  };

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase.from('menu_items').select('*');
      if (error) throw error;
      setMenuItems(data.filter(item => item.is_active) || []);
    } catch (error) {
      console.error('Error loading menu:', error);
      alert('ไม่สามารถโหลดเมนูได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const categories = ['ทั้งหมด', ...new Set(menuItems.map(item => item.category))];
  const filteredMenu = selectedCategory === 'ทั้งหมด' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addItemFromModal = () => {
    if (!selectedItem) return;
    
    const price = itemSize === 'normal' ? selectedItem.price_normal : selectedItem.price_special;
    let totalPrice = price;
    let itemName = selectedItem.name + ` (${itemSize === 'normal' ? 'ธรรมดา' : 'พิเศษ'})`;
    
    if (itemAddEgg === 'fried') {
      totalPrice += 10;
      itemName += ' + ไข่เจียว';
    } else if (itemAddEgg === 'sunny') {
      totalPrice += 10;
      itemName += ' + ไข่ดาว';
    }
    
    const cartItem = {
      id: selectedItem.id,
      cartId: `${selectedItem.id}-${itemSize}-${itemAddEgg}-${Date.now()}`,
      name: itemName,
      originalName: selectedItem.name,
      size: itemSize,
      addEgg: itemAddEgg,
      itemNote: itemNote,
      price: totalPrice,
      quantity: 1
    };

    setCart([...cart, cartItem]);
    setSelectedItem(null);
    setItemSize('normal');
    setItemAddEgg('none');
    setItemNote('');
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(i => i.cartId !== cartId));
  };

  const updateQuantity = (cartId, change) => {
    setCart(cart.map(i => {
      if (i.cartId === cartId) {
        const newQuantity = i.quantity + change;
        return newQuantity > 0 ? { ...i, quantity: newQuantity } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const uploadSlip = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('slips')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('slips')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading slip:', error);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSlipUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const url = await uploadSlip(file);
      setSlip(url);
      setLoading(false);
    }
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      alert('กรุณาเลือกเมนูอาหาร');
      return;
    }
    if (paymentMethod === 'online' && !slip) {
      alert('กรุณาแนบสลิปการชำระเงิน');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('orders').insert([{
        items: cart,
        note: orderNote || null,
        slip_url: paymentMethod === 'online' ? slip : null,
        total: getTotalPrice(),
        customer_phone: customerPhone || null,
        line_user_id: lineUserId || null,
        payment_method: paymentMethod,
        status: 'pending'
      }]);

      if (error) throw error;

      const successMessage = lineUserId 
        ? 'สั่งอาหารสำเร็จ! 🎉\n\nเราจะแจ้งเตือนสถานะออเดอร์ผ่าน LINE ของคุณ\nกรุณารอการยืนยันจากร้านค้า'
        : 'สั่งอาหารสำเร็จ! 🎉\nกรุณารอการยืนยันจากร้านค้า';
      
      alert(successMessage);
      setCart([]);
      setCustomerPhone('');
      setOrderNote('');
      setSlip(null);
      setPaymentMethod('online');
      setCurrentPage('menu');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isShopOpen === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isShopOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔴</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ร้านปิด</h1>
          <p className="text-gray-600 mb-6">ขออภัยค่ะ ร้านอาหารปัจจุบันปิดอยู่</p>
          <p className="text-gray-500">กรุณากลับมาใหม่ในช่วงเวลาที่ร้านเปิดค่ะ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {currentPage === 'menu' && (
          <>
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 relative">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-4xl">🍽️</span>
                ร้านอาหารตามสั่ง
              </h1>
              <p className="text-gray-600">เลือกเมนูที่คุณชอบและสั่งอาหารได้เลย</p>
              
              {lineUserId && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <span>✅</span>
                  <span>เชื่อมต่อ LINE แล้ว - รับการแจ้งเตือนสถานะออเดอร์</span>
                </div>
              )}
              
              {cart.length > 0 && (
                <button
                  onClick={() => document.getElementById('cart-section').scrollIntoView({ behavior: 'smooth' })}
                  className="absolute top-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all relative"
                >
                  <ShoppingCart size={24} />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 mb-6 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {filteredMenu.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden hover:scale-105"
                >
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-32 object-cover bg-gray-200"
                    onError={(e) => {
                      e.target.src = '🍽️';
                    }}
                  />
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-800 line-clamp-2 min-h-[40px]">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      {item.price_normal}-{item.price_special}฿
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">รายละเอียดเมนู</h2>
                    <button 
                      onClick={() => {
                        setSelectedItem(null);
                        setItemSize('normal');
                        setItemAddEgg('none');
                        setItemNote('');
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <img 
                      src={selectedItem.image} 
                      alt={selectedItem.name}
                      className="w-full h-48 object-cover rounded-lg mb-4 bg-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedItem.name}</h3>
                    <p className="text-gray-500 text-center mb-6">{selectedItem.category}</p>
                    
                    <div className="mb-6">
                      <label className="block font-medium text-gray-700 mb-3">เลือกขนาด</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setItemSize('normal')}
                          className={`py-3 px-4 rounded-lg font-medium transition-all ${
                            itemSize === 'normal'
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          ธรรมดา<br/>
                          <span className="text-lg font-bold">{selectedItem.price_normal}฿</span>
                        </button>
                        <button
                          onClick={() => setItemSize('special')}
                          className={`py-3 px-4 rounded-lg font-medium transition-all ${
                            itemSize === 'special'
                              ? 'bg-red-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          พิเศษ<br/>
                          <span className="text-lg font-bold">{selectedItem.price_special}฿</span>
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block font-medium text-gray-700 mb-3">เพิ่มไข่ (+10฿)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['none', 'fried', 'sunny'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setItemAddEgg(type)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              itemAddEgg === type
                                ? type === 'none' ? 'bg-gray-700 text-white' : 'bg-yellow-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {type === 'none' ? 'ไม่เพิ่ม' : type === 'fried' ? 'ไข่เจียว' : 'ไข่ดาว'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block font-medium text-gray-700 mb-2">หมายเหตุถึงร้านค้า</label>
                      <textarea
                        value={itemNote}
                        onChange={(e) => setItemNote(e.target.value)}
                        placeholder="เช่น ไม่ใส่ผักชี, เผ็ดน้อย..."
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows="3"
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">ราคารวม</span>
                        <span className="text-2xl font-bold text-orange-600">
                          {(itemSize === 'normal' ? selectedItem.price_normal : selectedItem.price_special) + 
                           (itemAddEgg !== 'none' ? 10 : 0)}฿
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={addItemFromModal}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      เพิ่มลงตะกร้า
                    </button>
                  </div>
                </div>
              </div>
            )}

            {cart.length > 0 && (
              <div id="cart-section" className="bg-white rounded-xl shadow-xl p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                  <ShoppingCart className="text-orange-500" />
                  ตะกร้าของคุณ
                </h2>
                
                <div className="space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item.cartId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.itemNote && (
                          <p className="text-xs text-gray-500 italic mt-1">หมายเหตุ: {item.itemNote}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white rounded-lg px-2">
                          <button
                            onClick={() => updateQuantity(item.cartId, -1)}
                            className="text-orange-500 font-bold text-xl w-8 h-8 hover:bg-orange-50 rounded"
                          >
                            -
                          </button>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartId, 1)}
                            className="text-orange-500 font-bold text-xl w-8 h-8 hover:bg-orange-50 rounded"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-bold text-orange-600 w-20 text-right">{item.price * item.quantity}฿</p>
                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                    <span>ยอดรวม:</span>
                    <span className="text-orange-600">{getTotalPrice()}฿</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-2">เบอร์โทรติดต่อ (ไม่บังคับ)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0812345678"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-2">หมายเหตุเพิ่มเติม (ไม่บังคับ)</label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="หมายเหตุสำหรับคำสั่งซื้อทั้งหมด..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <button
                  onClick={() => setCurrentPage('payment')}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-bold text-lg transition-all shadow-md"
                >
                  ดำเนินการชำระเงิน
                </button>
              </div>
            )}
          </>
        )}

        {currentPage === 'payment' && (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setCurrentPage('menu')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← กลับ
              </button>
              <h2 className="text-2xl font-bold text-gray-800">ชำระเงิน</h2>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 text-gray-800">เลือกวิธีชำระเงิน</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'online'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">💳</div>
                  <div className="font-bold text-gray-800">จ่ายเลย</div>
                  <div className="text-xs text-gray-500 mt-1">โอนเงินผ่าน QR Code</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">💵</div>
                  <div className="font-bold text-gray-800">ชำระหน้าร้าน</div>
                  <div className="text-xs text-gray-500 mt-1">จ่ายเงินสดตอนรับของ</div>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-lg mb-3 text-gray-800">สรุปรายการสั่งซื้อ</h3>
              <div className="space-y-2 mb-3">
                {cart.map(item => (
                  <div key={item.cartId} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} x{item.quantity}</span>
                    <span className="font-medium text-gray-800">{item.price * item.quantity}฿</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-800">ยอดรวมทั้งหมด:</span>
                  <span className="text-2xl font-bold text-orange-600">{getTotalPrice()}฿</span>
                </div>
              </div>
            </div>

            {lineUserId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm flex items-center gap-2">
                  <span>✅</span>
                  <span>คุณจะได้รับการแจ้งเตือนสถานะออเดอร์ผ่าน LINE</span>
                </p>
              </div>
            )}

            {paymentMethod === 'online' && (
              <>
                <div className="bg-gray-50 p-6 rounded-lg text-center mb-6">
                  <h3 className="font-bold text-lg mb-3 text-gray-800">สแกน QR Code เพื่อชำระเงิน</h3>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src="/Qr_code.JPG" alt="QR Code" className="w-48 h-48 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">QR Code PromptPay</p>
                    <p className="font-bold text-orange-600 text-xl mt-1">{getTotalPrice()}฿</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block font-medium mb-2 text-gray-700">แนบสลิปการชำระเงิน *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSlipUpload}
                    className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                    disabled={loading}
                  />
                  {slip && (
                    <div className="mt-2 bg-gray-50 p-2 rounded-lg">
                      <img src={slip} alt="สลิป" className="max-w-xs mx-auto rounded-lg shadow-md" />
                    </div>
                  )}
                </div>
              </>
            )}

            {paymentMethod === 'cash' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-yellow-800 mb-2">📌 ข้อมูลสำคัญ</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• กรุณาเตรียมเงินพอดี {getTotalPrice()}฿</li>
                  <li>• ชำระเงินสดตอนมารับอาหารที่ร้าน</li>
                  <li>• รอการยืนยันออเดอร์จากร้านก่อนนะคะ</li>
                </ul>
              </div>
            )}

            <button
              onClick={submitOrder}
              disabled={loading || (paymentMethod === 'online' && !slip)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold text-lg transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังส่งออเดอร์...' : 'ยืนยันการสั่งอาหาร'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerApp;