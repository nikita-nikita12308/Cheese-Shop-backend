// Alert
const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

// type success or error
const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};

// REGISTER
const signup = async (name, email, password, passwordConfirm) => {
    try {
        const resultSignup = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        });
        if (resultSignup.data.status === 'success') {
            showAlert('success', 'Register successfully! Please, Sign In');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

if(document.querySelector('.registerUser')){
    document.querySelector('.registerUser').addEventListener('submit', e => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signup(name, email, password, passwordConfirm);
    });
}

// Sign in
const login = async (email, password) => {
    try{
        const res = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:8000/api/v1/users/login',
        data: {
            email,
            password
        }
    });
    if(res.data.status === 'success') {
        showAlert('success', 'Logged in successfully');
        window.setTimeout(() => {
            location.assign('/');
        }, 1500);
    }
    }catch(e){
        showAlert('error', e.response.data.message);
    }
};

if(document.querySelector('.loginUser')){
    document.querySelector('.loginUser').addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login( email, password )
    });
}

// Log Out
const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:8000/api/v1/users/logout'
        });
        if(res.data.status === 'success') {
            showAlert('success', 'Logged out successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    }catch(e){
        showAlert('error', 'Error logging out! Try again')
    }
};

if( document.querySelector('.nav__el--logout')) {
    document.querySelector('.nav__el--logout').addEventListener('click', logout);
}

const updateUserData = async (data, type) => {
    try{
        const url = type === 'password'
            ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
            : 'http://127.0.0.1:8000/api/v1/users/updateMe';

        const updateRes = await axios({
            method: 'PATCH',
            url,
            data
        });
        if (updateRes.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`);
            window.setTimeout(() => {
                location.reload(true)
            }, 1500);

        }
    }catch(e){
        showAlert('error', e.response.data.message);
    }
};

if(document.querySelector('.updateCurrentUser')){
    document.querySelector('.updateCurrentUser').addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save--userdata').textContent = 'Updating...';

        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        await updateUserData(form, 'data');

        document.querySelector('.btn--save--userdata').textContent = 'Save settings';
    });
}



if(document.querySelector('.form-user-settings')){
    document.querySelector('.form-user-settings').addEventListener('submit', async e => {
        document.querySelector('.btn--save--password').textContent = 'Updating...';
        e.preventDefault();

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        await updateUserData({
            passwordCurrent,
            password,
            passwordConfirm
        }, 'password');

        document.querySelector('.btn--save--password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

const bookTour = async (tourId) => {
    try {
        const session = await axios(`http://127.0.0.1:8000/api/v1/booking/checkout-session/${tourId}`);
        console.log(session.data.url);
        window.location.assign(session.data.url);
    } catch(err) {
        showAlert('error', err);
        console.log(err.message)
    }
};

const bookBtn = document.getElementById('book-tour');

if(bookBtn){
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';

        const {tourId} = e.target.dataset;
        console.log(tourId);
        bookTour(tourId)
    })
}