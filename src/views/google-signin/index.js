import React, { useEffect, useState } from 'react';

import { connect } from 'react-redux'

import { withRouter } from 'react-router';

import { signInWithGoogle } from './store/actions'

import { GoogleLogin } from 'react-google-login';

import { notifyError, notifySuccess } from '../../utility/toast';


let clientId = "378379895413-ovfahkbo3b8g9vv890jc2apsjkbirj61.apps.googleusercontent.com";



const GoogleSignIn = (props) => {

    const { processingCallBack } = props
    const [isSigning, setIsSigning] = useState(false)

    useEffect(() => {
        if (isSigning && !props.loading && props.error) {
            setIsSigning(false)
            processingCallBack()
            notifyError("Sign in with Google", props.error)
        }
        else if (isSigning && !props.loading && !props.error) {
            setIsSigning(false)
            processingCallBack()
            notifySuccess("Sign in with Google", "You have signed in successfully.")
        }

    }, [props.loading])

    const responseGoogle = (googleUser) => {
        let profile = googleUser.getBasicProfile();

        setIsSigning(true)
        processingCallBack()
        props.signInWithGoogle({
            data: {
                name: profile.getName(),
                email: profile.getEmail(),
                accessToken: googleUser.getAuthResponse().access_token
            },
            history: props.history
        })
    }

    const googleResponseFailure = (response) => {
        console.log("googleResponseFailure", response)
    }

    return <GoogleLogin
        clientId={clientId}
        buttonText="Sign in with Google"
        onSuccess={responseGoogle}
        onFailure={googleResponseFailure}
        cookiePolicy={'single_host_origin'}
    />
}

const mapStateToProps = (state) => {
    const {
        error,
        loading
    } = state.GoogleSignIn
    return {
        error,
        loading
    }
}

export default withRouter(
    connect(mapStateToProps, {
        signInWithGoogle
    })(GoogleSignIn)
)