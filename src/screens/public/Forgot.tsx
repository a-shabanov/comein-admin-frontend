import React, {useEffect} from "react";
import {observer} from "mobx-react-lite";
import {Link} from "react-router-dom";
import styled from "astroturf";

import {Logo} from "../../components/logo/Logo";
import {ForgotForm} from "../../components/auth/ForgotForm";
import {useAuthStore} from "../../providers/StoreProvider";

import {PublicWrapper} from "./PublicWrapper";


const Subtitle = styled.span`
  color: #5F5E5E;
  margin: 8px auto;
  font-size: 16px;
  width: 200px;
`

const FormWrapper = styled.div`
  width: 250px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
`

const SuccessMessage = styled.div`
  margin: 12px auto;
`

const RegisterWrapper = styled.div`
  padding-bottom: 32px;
  color: #5F5E5E;
`

const RegisterLink = styled(Link)`
  color: #45A5F9;
  text-decoration: none;
`

const PageTitle = styled.div`
  margin-top: 20px;
  font-size: 18px;
  color: #5F5E5E;
`

export const Forgot = observer(function Forgot() {
  const authStore = useAuthStore();

  useEffect(() => {
    authStore.clear();
  }, [authStore.clear])

  return (
    <PublicWrapper>
      <div/>
      <FormWrapper>
        <Logo/>
        <Subtitle>личный кабинет организатора</Subtitle>
        <div>
          <PageTitle>Забыли пароль?</PageTitle>
          {!authStore.successForgotEmail ? (
            <ForgotForm/>
          ) : (
            <SuccessMessage>Иструкция для восстановления пароля отправлена Вам на почту</SuccessMessage>
          )
          }
        </div>
      </FormWrapper>
      <RegisterWrapper>
        <RegisterLink to='/auth'>Войти в аккаунт</RegisterLink>
      </RegisterWrapper>
    </PublicWrapper>
  )
});
