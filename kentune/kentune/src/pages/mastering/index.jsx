



import React, { useState } from 'react';
import MpesaPaymentForm from '../../components/MpesaPaymentForm';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const Mastering = () => {
		const [trackFile, setTrackFile] = useState(null);
		const [trackName, setTrackName] = useState('');
		const [artistName, setArtistName] = useState('');
		const [error, setError] = useState('');
		const [success, setSuccess] = useState(false);
		const [artistInstructions, setArtistInstructions] = useState('');
		const [deliveryMethod, setDeliveryMethod] = useState('');
		const [deliveryContact, setDeliveryContact] = useState('');
		const [showPayment, setShowPayment] = useState(false);
		const [paymentComplete, setPaymentComplete] = useState(false);
		const [uploading, setUploading] = useState(false);

	const handleFileChange = (e) => {
		setTrackFile(e.target.files[0]);
	};


	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');
		setSuccess(false);
		if (!trackFile || !trackName || !artistName || !deliveryMethod || !deliveryContact) {
			setError('Please fill all required fields and upload your track.');
			return;
		}
		setError('');
		setSuccess(false);
		setShowPayment(true);
	};



	const handleCancelPayment = () => {
		setShowPayment(false);
		setPaymentComplete(false);
		setError('Payment not completed. Please try again.');
	};

	return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700 animate-gradient-x">
				<div className="w-full max-w-xl bg-white/90 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center animate-fade-in-up">
					<h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 animate-text-glow mb-4">Mastering</h2>
					<p className="text-xl font-bold text-pink-600 mb-2">Radio Ready Mastering</p>
					<p className="text-gray-700 text-center mb-4">Upload your track for professional mastering. Pay KSh 200 per track to make it radio ready.</p>

							{/* How This Works Section */}
							<div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
								<h3 className="text-lg font-semibold text-blue-700 mb-2">How This Works</h3>
								<ul className="list-disc pl-5 text-blue-900 text-sm mb-2">
									<li>Upload your track and fill in the required details below.</li>
									<li>Pay KSh 200 per track to start mastering.</li>
									<li>Our engineers will master your track to meet radio standards (loudness, clarity, balance, EQ, compression, limiting, noise removal).</li>
									<li>Delivery takes 1-4 days depending on track length, complexity, and workload.</li>
									<li>You will receive your mastered track in high-quality MP3 and WAV formats.</li>
								</ul>
								<div className="text-blue-900 text-xs">Working hours and queue may affect delivery time. We will notify you once your track is ready.</div>
							</div>

					{error && <div className="text-danger mb-2">{error}</div>}
					{success && <div className="text-success mb-2">Paid and submitted! Our engineers are working on it.</div>}
					{/* Audio preview for uploaded track */}
					{trackFile && (
						<div className="mb-4">
							<label className="block font-medium mb-1">Track Preview</label>
							<audio controls src={URL.createObjectURL(trackFile)} style={{ width: '100%' }}>
								Your browser does not support the audio element.
							</audio>
						</div>
					)}
							{/* Mpesa Payment Form Popup */}
							{showPayment && !paymentComplete && (
								<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
													<MpesaPaymentForm
														selectedAmount={200}
														isAmountReadOnly={true}
														planType="mastering"
														onClose={() => setShowPayment(false)}
														successMessage="🎉 Hooray! Your mastering submission has been sent. Our engineers will review and deliver your mastered track soon."
														successButtonText={success ? "Back to Dashboard" : "Saving..."}
														successButtonAction={() => {
															if (success) {
																setShowPayment(false);
																window.location.href = '/artist-dashboard';
															}
														}}
														externalLoading={uploading}
														onPaymentSuccess={async () => {
															try {
																setUploading(true);
																const file = trackFile;
																const name = trackName;
																const artist = artistName;
																const instructions = artistInstructions;
																const method = deliveryMethod;
																const contact = deliveryContact;
																const auth = await import('firebase/auth');
																const { getAuth } = auth;
																const user = getAuth().currentUser;
																if (!user) throw new Error('User not authenticated');
																const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
																const storage = getStorage();
																const storageRef = ref(storage, `mastering/${user.uid}/${Date.now()}_${file.name}`);
																await uploadBytes(storageRef, file);
																const trackUrl = await getDownloadURL(storageRef);
																if (!trackUrl) {
																	setError('Track upload succeeded but no download URL was returned.');
																	setUploading(false);
																	return;
																}
																const { collection, addDoc } = await import('firebase/firestore');
																const db = (await import('../../lib/firebase')).db;
																const masteringDoc = {
																	userId: user.uid,
																	artistName: artist,
																	trackName: name,
																	artistInstructions: instructions,
																	deliveryMethod: method,
																	deliveryContact: contact,
																	trackUrl,
																	status: 'pending',
																	createdAt: new Date().toISOString(),
																	paid: true,
																	amount: 200
																};
																await addDoc(collection(db, 'mastering_requests'), masteringDoc);
																setUploading(false);
																setSuccess(true);
																setShowPayment(false);
																setTrackFile(null);
																setTrackName('');
																setArtistName('');
																setArtistInstructions('');
																setDeliveryMethod('');
																setDeliveryContact('');
			{/* Loading spinner after mastering payment, before confirmation */}
			{uploading && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto">
						<div className="loader mb-4" style={{ margin: '0 auto', width: 48, height: 48, border: '6px solid #e6ffe6', borderTop: '6px solid #009e3a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
						<h2 className="text-xl font-bold text-blue-700 mb-2">Submitting your mastering request...</h2>
						<p className="text-gray-800">Please wait while we save your track and details.</p>
					</div>
					<style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
				</div>
			)}
			{/* Confirmation popup after mastering payment and request creation */}
			{success && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto">
						<h2 className="text-2xl font-bold text-green-700 mb-4">🎉 Mastering Request Sent!</h2>
						<p className="text-lg text-gray-800 mb-4">Your track has been submitted for mastering. You will be notified once it is ready for delivery.</p>
						<button className="bg-green-600 text-white px-6 py-2 rounded font-semibold mt-2" onClick={() => { setSuccess(false); setTrackFile(null); setTrackName(''); setArtistName(''); setArtistInstructions(''); setDeliveryMethod(''); setDeliveryContact(''); window.location.href = '/artist-dashboard'; }}>Back to Dashboard</button>
					</div>
				</div>
			)}
															} catch (err) {
																setError('Failed to upload audio or save mastering request.');
																console.error('Mastering error:', err);
															}
														}}
													/>
								</div>
							)}
						<form onSubmit={handleSubmit} className="space-y-4 w-full">
					{/* Delivery Method Section */}
					<div>
						<label className="block font-medium mb-1">How do you wish to receive the mastered track?</label>
						<select
							className="w-full border rounded px-3 py-2"
							value={deliveryMethod}
							onChange={e => { setDeliveryMethod(e.target.value); setDeliveryContact(''); }}
							required
						>
							<option value="">Select delivery method</option>
							<option value="whatsapp">WhatsApp</option>
							<option value="email">Email</option>
						</select>
					</div>
					{deliveryMethod === 'whatsapp' && (
						<div>
							<label className="block font-medium mb-1">WhatsApp Number</label>
							<input
								type="text"
								className="w-full border rounded px-3 py-2"
								value={deliveryContact}
								onChange={e => setDeliveryContact(e.target.value)}
								placeholder="Enter your WhatsApp number"
								required
							/>
							<div className="text-xs text-blue-700 mt-1">This number will be used to send you the mastered tracks. Please ensure it is correct.</div>
						</div>
					)}
					{deliveryMethod === 'email' && (
						<div>
							<label className="block font-medium mb-1">Email Address</label>
							<input
								type="email"
								className="w-full border rounded px-3 py-2"
								value={deliveryContact}
								onChange={e => setDeliveryContact(e.target.value)}
								placeholder="Enter your email address"
								required
							/>
							<div className="text-xs text-blue-700 mt-1">This email will be used to send you the mastered tracks. Please ensure it is correct.</div>
						</div>
					)}
								<div>
									<label className="block font-medium mb-1">Track Name</label>
									<input type="text" className="w-full border rounded px-3 py-2" value={trackName} onChange={e => setTrackName(e.target.value)} required />
								</div>
								<div>
									<label className="block font-medium mb-1">Artist Name</label>
									<input type="text" className="w-full border rounded px-3 py-2" value={artistName} onChange={e => setArtistName(e.target.value)} required />
								</div>
								<div>
									<label className="block font-medium mb-1">Upload Track (MP3/WAV)</label>
									<input type="file" accept="audio/*" onChange={handleFileChange} required />
								</div>
								<div>
									<label className="block font-medium mb-1">Instructions for the Engineer (optional)</label>
									<textarea
										className="w-full border rounded px-3 py-2 min-h-[80px]"
										value={artistInstructions}
										onChange={e => setArtistInstructions(e.target.value)}
										placeholder="Add any specific instructions for mastering your track (optional)"
									/>
								</div>
								<button type="submit" className="w-full bg-pink-600 text-white py-2 rounded font-bold hover:bg-pink-700">Send for Mastering</button>
							</form>
				</div>
			</div>
	);
};

export default Mastering;



