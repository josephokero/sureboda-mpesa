
import { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { getAuth, onAuthStateChanged } from 'firebase/auth';

const YoutubeConnect = () => {
  const [openForm, setOpenForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  // Form 1 state
  const [form1, setForm1] = useState({
    name: '',
    email: '',
    artistName: '',
    issueType: '',
    oacChannel: '',
    summary: ''
  });
  // Form 2 state
  const [form2, setForm2] = useState({
    name: '',
    email: '',
    artistName: '',
    oacChannel: '',
    topicChannel: '',
    upc: ''
  });
  // Form 3 state
  const [form3, setForm3] = useState({
    name: '',
    email: '',
    artist: '',
    claimType: '',
    urls: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) {
        window.location.href = '/clean-sign-in-page';
      }
    });
    return () => unsubscribe();
  }, []);
  const [explanation1Visible, setExplanation1Visible] = useState(true);
  const [explanation2Visible, setExplanation2Visible] = useState(true);
  const [explanation3Visible, setExplanation3Visible] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
        <span className="ml-4 text-lg text-blue-700">Checking authentication...</span>
      </div>
    );
  }
  if (!user) {
    return null;
  }
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Editorial Note */}
      <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-400 rounded">
        <span className="font-semibold text-yellow-800">Note:</span> Only fill the form that applies to you. If you are unsure which form to fill, please contact support for assistance.
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-900">Astute YouTube Channel Management</h1>
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded shadow"
          onClick={() => window.location.href = '/artist-dashboard'}
        >
          Go back to your dashboard
        </button>
      </div>
      <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <h2 className="text-xl font-semibold mb-2 text-blue-800">Artist Instructions</h2>
        <ul className="list-disc ml-6 text-gray-700 space-y-2">
          <li>Use this page to manage your YouTube artist channel, request an Official Artist Channel (OAC), or whitelist/release claims for your videos and channels.</li>
          <li>Choose the relevant section below and fill out the form as accurately as possible.</li>
          <li>Provide all required information and double-check your URLs and codes before submitting.</li>
          <li>After submitting, allow the stated processing time for each request type. You will be contacted via email if further information is needed.</li>
          <li>If you need help, contact support or refer to the official YouTube documentation linked in the forms.</li>
        </ul>
      </div>

      {/* Section 1: Artist Channel Fixes */}
      <section className="mb-8 p-6 bg-white rounded shadow">
        <h2
          className="text-xl font-semibold mb-2 cursor-pointer text-blue-700 hover:underline"
          onClick={() => setOpenForm(openForm === 1 ? null : 1)}
        >
          1. YouTube Artist Channel Fixes
        </h2>
        {/* Explanation below title, dismissible */}
        {(!openForm || openForm !== 1) && (
          explanation1Visible && (
            <div className="text-sm text-orange-500 mb-2 cursor-pointer" onClick={() => setExplanation1Visible(false)}>
              Use this section to request fixes for your YouTube artist channel, merge Topic/VEVO channels, or migrate releases. Click to dismiss.
            </div>
          )
        )}
        {openForm === 1 && (
          <div className="mt-4 relative">
            <button
              className="absolute top-0 right-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-3 py-1 rounded"
              onClick={() => setOpenForm(null)}
            >
              Close
            </button>
            {/* Removed blue subheading */}
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <strong>YOUTUBE ARTIST CHANNEL FIX REQUEST FORM</strong><br /><br />
              This form is not for YouTube OAC (Original Artist Channel) requests. If you need to create an OAC in order to merge an O&O channel, Topic channel and (optionally) a VEVO channel, please use the <a href="#oac-request" className="text-blue-600 underline" onClick={e => {e.preventDefault(); setOpenForm(2); document.getElementById('oac-request')?.scrollIntoView({behavior: 'smooth'});}}>YouTube OAC Request Form</a> for that.<br /><br />
              <u>Use this form for the following:</u><br />
              <ul className="list-disc ml-6">
                <li>Merge an existing Topic or VEVO channel with an existing OAC channel</li>
                <li>Merge multiple Topic channels</li>
                <li>Migrate a release from the ‘Release – Topic’ channel to a new Topic channel</li>
              </ul>
              <br />
              OACs can be recognized by a music note after the artist’s YouTube channel name, along with the ‘Music Videos’ and ‘Albums’ shelves being present on the channel page.<br /><br />
              Official information on YouTube OAC Channels can be found <a href="https://support.google.com/youtube/answer/7336634?hl=en" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">here</a>.
            </div>
            <form className="space-y-6" onSubmit={async e => {
              e.preventDefault();
              setSubmitting(true);
              setError('');
              setSuccess(false);
              setTrackingNumber('');
              const user = auth.currentUser;
              if (!user) {
                setError('You must be signed in to submit.');
                setSubmitting(false);
                return;
              }
              try {
                // First add without trackingNumber
                const docRef = await addDoc(collection(db, 'youtubeRequests'), {
                  type: 'artist-channel-fix',
                  name: form1.name,
                  email: form1.email,
                  artistName: form1.artistName,
                  issueType: form1.issueType,
                  oacChannel: form1.oacChannel,
                  summary: form1.summary,
                  userId: user.uid,
                  createdAt: new Date().toISOString()
                });
                // Then update with trackingNumber (doc ID)
                await setDoc(docRef, { trackingNumber: docRef.id }, { merge: true });
                setTrackingNumber(docRef.id);
                setSuccess(true);
                setForm1({ name: '', email: '', artistName: '', issueType: '', oacChannel: '', summary: '' });
              } catch (err) {
                setError('Failed to submit. Please try again.');
              }
              setSubmitting(false);
            }}>
              <div>
                <label className="block font-medium mb-1">Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="Name" value={form1.name} onChange={e => setForm1(f => ({...f, name: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" required className="w-full border rounded px-3 py-2" placeholder="Email" value={form1.email} onChange={e => setForm1(f => ({...f, email: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Artist name <span className="text-red-500">*</span></label>
                <input type="text" required className="w-full border rounded px-3 py-2" placeholder="Artist name" value={form1.artistName} onChange={e => setForm1(f => ({...f, artistName: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Issue type <span className="text-red-500">*</span></label>
                <select required className="w-full border rounded px-3 py-2" value={form1.issueType} onChange={e => setForm1(f => ({...f, issueType: e.target.value}))}>
                  <option value="">Select issue type</option>
                  <option>Merge a VEVO or Topic channel with an existing OAC</option>
                  <option>Merge multiple Topic channels</option>
                  <option>Migrate a release from the ‘Release – Topic’ channel to a new Topic channel</option>
                  <option>Others</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Artist's Owned & Operated (O&O) Channel <span className="text-red-500">*</span></label>
                <textarea required className="w-full border rounded px-3 py-2" rows={3}
                  placeholder="Please enter full URL, including the 24 character channel ID. The URL must equal 56 characters total.\nFor example: https://www.youtube.com/channel/UCXX1xxXX1XxxxX_xXXxXXXx . Please do not provide vanity URLs, i.e. https://www.youtube.com/c/memberX or https://www.youtube.com/user/memberX"
                  value={form1.oacChannel} onChange={e => setForm1(f => ({...f, oacChannel: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Summarize your issue <span className="text-red-500">*</span></label>
                <textarea required className="w-full border rounded px-3 py-2" rows={4}
                  placeholder="Please include UPCs (rather than YouTube links) if you are requesting for releases to be remapped to other channels."
                  value={form1.summary} onChange={e => setForm1(f => ({...f, summary: e.target.value}))} />
              </div>
              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              {success && (
                <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded mb-2 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-green-700">Success!</span> Your request has been submitted.<br />
                    <span className="text-sm text-green-800">Tracking Number: <span className="font-mono bg-green-200 px-2 py-1 rounded">{trackingNumber}</span></span><br />
                    <span className="text-xs text-green-700">Please save this tracking number and keep it in a safe place. You will be asked for it in case of any issue or support request.</span>
                  </div>
                  <button className="ml-4 bg-green-200 hover:bg-green-300 text-green-900 font-semibold px-3 py-1 rounded" onClick={() => setSuccess(false)}>Close</button>
                </div>
              )}
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
            </form>
          </div>
        )}
      </section>

      {/* Section 2: OAC Request Form */}
      <section className="mb-8 p-6 bg-white rounded shadow" id="oac-request">
        <h2
          className="text-xl font-semibold mb-2 cursor-pointer text-blue-700 hover:underline"
          onClick={() => setOpenForm(openForm === 2 ? null : 2)}
        >
          2. OAC Request Form
        </h2>
        {/* Explanation below title, dismissible */}
        {(!openForm || openForm !== 2) && (
          explanation2Visible && (
            <div className="text-sm text-orange-500 mb-2 cursor-pointer" onClick={() => setExplanation2Visible(false)}>
              Use this section to request an Official Artist Channel (OAC) on YouTube. Click to dismiss.
            </div>
          )
        )}
        {openForm === 2 && (
          <div className="mt-4 relative">
            <button
              className="absolute top-0 right-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-3 py-1 rounded"
              onClick={() => setOpenForm(null)}
            >
              Close
            </button>
            {/* Removed blue subheading */}
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <strong>OAC REQUEST FORM</strong><br /><br />
              To request an OAC (Official Artist Channel), please provide below info.<br /><br />
              Please note that it takes YouTube up to four weeks to process. They do not provide any progress updates.
            </div>
            <form className="space-y-6" onSubmit={async e => {
              e.preventDefault();
              setSubmitting(true);
              setError('');
              setSuccess(false);
              setTrackingNumber('');
              const user = auth.currentUser;
              if (!user) {
                setError('You must be signed in to submit.');
                setSubmitting(false);
                return;
              }
              try {
                const docRef = await addDoc(collection(db, 'youtubeRequests'), {
                  type: 'oac-request',
                  name: form2.name,
                  email: form2.email,
                  artistName: form2.artistName,
                  oacChannel: form2.oacChannel,
                  topicChannel: form2.topicChannel,
                  upc: form2.upc,
                  userId: user.uid,
                  createdAt: new Date().toISOString()
                });
                await setDoc(docRef, { trackingNumber: docRef.id }, { merge: true });
                setTrackingNumber(docRef.id);
                setSuccess(true);
                setForm2({ name: '', email: '', artistName: '', oacChannel: '', topicChannel: '', upc: '' });
              } catch (err) {
                setError('Failed to submit. Please try again.');
              }
              setSubmitting(false);
            }}>
              <div>
                <label className="block font-medium mb-1">Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="Name" value={form2.name} onChange={e => setForm2(f => ({...f, name: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" required className="w-full border rounded px-3 py-2" placeholder="Email" value={form2.email} onChange={e => setForm2(f => ({...f, email: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Artist name <span className="text-red-500">*</span></label>
                <input type="text" required className="w-full border rounded px-3 py-2" placeholder="Artist name" value={form2.artistName} onChange={e => setForm2(f => ({...f, artistName: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Artist's Owned & Operated (O&O) Channel <span className="text-red-500">*</span></label>
                <textarea required className="w-full border rounded px-3 py-2" rows={3}
                  placeholder="Please enter full URL, including the 24 character channel ID. The URL must equal 56 characters total.\nFor example: https://www.youtube.com/channel/UCXX1xxXX1XxxxX_xXXxXXXx . Please do not provide vanity URLs, i.e. https://www.youtube.com/c/memberX or https://www.youtube.com/user/memberX"
                  value={form2.oacChannel} onChange={e => setForm2(f => ({...f, oacChannel: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Artist's Topic Channel <span className="text-red-500">*</span></label>
                <textarea required className="w-full border rounded px-3 py-2" rows={3}
                  placeholder="Please enter full URL, including the 24 character channel ID. The URL must equal 56 characters total.\nFor example: https://www.youtube.com/channel/UCXX1xxXX1XxxxX_xXXxXXXx . Please do not provide vanity URLs, i.e. https://www.youtube.com/c/memberX or https://www.youtube.com/user/memberX ."
                  value={form2.topicChannel} onChange={e => setForm2(f => ({...f, topicChannel: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">UPCs of delivered release(s) through Kentunez <span className="text-red-500">*</span></label>
                <input type="text" required className="w-full border rounded px-3 py-2" placeholder="Name at least one UPC delivered through Kentunez" value={form2.upc} onChange={e => setForm2(f => ({...f, upc: e.target.value}))} />
              </div>
              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              {success && (
                <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded mb-2 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-green-700">Success!</span> Your request has been submitted.<br />
                    <span className="text-sm text-green-800">Tracking Number: <span className="font-mono bg-green-200 px-2 py-1 rounded">{trackingNumber}</span></span>
                  </div>
                  <button className="ml-4 bg-green-200 hover:bg-green-300 text-green-900 font-semibold px-3 py-1 rounded" onClick={() => setSuccess(false)}>Close</button>
                </div>
              )}
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit OAC Request'}</button>
            </form>
          </div>
        )}
      </section>

      {/* Section 3: Channel Allowlist Request */}
      <section className="mb-8 p-6 bg-white rounded shadow">
        <h2
          className="text-xl font-semibold mb-2 cursor-pointer text-blue-700 hover:underline"
          onClick={() => setOpenForm(openForm === 3 ? null : 3)}
        >
          3. Channel Allowlist Request
        </h2>
        {/* Explanation below title, dismissible */}
        {(!openForm || openForm !== 3) && (
          explanation3Visible && (
            <div className="text-sm text-orange-500 mb-2 cursor-pointer" onClick={() => setExplanation3Visible(false)}>
              Use this section to whitelist your channel or release video claims. Click to dismiss.
            </div>
          )
        )}
        {openForm === 3 && (
          <div className="mt-4 relative">
            <button
              className="absolute top-0 right-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-3 py-1 rounded"
              onClick={() => setOpenForm(null)}
            >
              Close
            </button>
            {/* Removed blue subheading */}
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <strong>YOUTUBE WHITELIST / VIDEO CLAIMS RELEASE REQUEST</strong><br /><br />
              Fill out this form to whitelist a channel and/or release a claim. Allow up to 4 workdays to process your request.
            </div>
            <form className="space-y-6" onSubmit={async e => {
              e.preventDefault();
              setSubmitting(true);
              setError('');
              setSuccess(false);
              setTrackingNumber('');
              const user = auth.currentUser;
              if (!user) {
                setError('You must be signed in to submit.');
                setSubmitting(false);
                return;
              }
              try {
                const docRef = await addDoc(collection(db, 'youtubeRequests'), {
                  type: 'allowlist-request',
                  name: form3.name,
                  email: form3.email,
                  artist: form3.artist,
                  claimType: form3.claimType,
                  urls: form3.urls,
                  userId: user.uid,
                  createdAt: new Date().toISOString()
                });
                await setDoc(docRef, { trackingNumber: docRef.id }, { merge: true });
                setTrackingNumber(docRef.id);
                setSuccess(true);
                setForm3({ name: '', email: '', artist: '', claimType: '', urls: '' });
              } catch (err) {
                setError('Failed to submit. Please try again.');
              }
              setSubmitting(false);
            }}>
              <div>
                <label className="block font-medium mb-1">Name</label>
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="Name" value={form3.name} onChange={e => setForm3(f => ({...f, name: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" required className="w-full border rounded px-3 py-2" placeholder="Email" value={form3.email} onChange={e => setForm3(f => ({...f, email: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Artist <span className="text-red-500">*</span></label>
                <input type="text" required className="w-full border rounded px-3 py-2" placeholder="Artist" value={form3.artist} onChange={e => setForm3(f => ({...f, artist: e.target.value}))} />
              </div>
              <div>
                <label className="block font-medium mb-1">Are you releasing claims on a video or whitelisting a channel? <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="claimType" value="release" required className="accent-blue-600" checked={form3.claimType === 'release'} onChange={e => setForm3(f => ({...f, claimType: e.target.value}))} />
                    Releasing claims on videos
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="claimType" value="whitelist" required className="accent-blue-600" checked={form3.claimType === 'whitelist'} onChange={e => setForm3(f => ({...f, claimType: e.target.value}))} />
                    Whitelisting channel
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="claimType" value="both" required className="accent-blue-600" checked={form3.claimType === 'both'} onChange={e => setForm3(f => ({...f, claimType: e.target.value}))} />
                    Both
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Please provide the full URL(s) to the video(s) whose claims you want released and/or channel(s) you are requesting to have whitelisted. Add one URL per line. <span className="text-red-500">*</span></label>
                <textarea required className="w-full border rounded px-3 py-2" rows={4}
                  placeholder="For channels, please do not provide vanity urls like https://www.youtube.com/c/memberX or https://www.youtube.com/user/memberX . If you do not know the true url, go to the channel, click on a video, then below where it says the artist's/channel's name, right click to open the channel in a new tab, and in that new tab the 24 character url will appear. Please include the full URL of each."
                  value={form3.urls} onChange={e => setForm3(f => ({...f, urls: e.target.value}))} />
              </div>
              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              {success && (
                <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded mb-2 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-green-700">Success!</span> Your request has been submitted.<br />
                    <span className="text-sm text-green-800">Tracking Number: <span className="font-mono bg-green-200 px-2 py-1 rounded">{trackingNumber}</span></span>
                  </div>
                  <button className="ml-4 bg-green-200 hover:bg-green-300 text-green-900 font-semibold px-3 py-1 rounded" onClick={() => setSuccess(false)}>Close</button>
                </div>
              )}
              <button type="submit" className="w-full bg-yellow-400 text-black font-semibold px-4 py-2 rounded" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
};

export default YoutubeConnect;
