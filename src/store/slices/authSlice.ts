import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'
import { User } from '../../schemas/user.schema'
import { userService } from '../../services/userService'

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  authError?: AuthError | null | undefined
}

interface AuthError {
  type: string
  message: string
  code?: string
  details?: string
}

interface errorResponse {
  type: string
  message: string
  error_description?: string
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  user: null
}

// LOGIN thunk
export const loginUser = createAsyncThunk<User, { email: string; password: string }, { rejectValue: AuthError }>(
  'auth/loginUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const { user } = await userService.signIn({ email, password })
      if (!user) throw new Error('No se pudo iniciar sesión')

      const profile = await userService.getUserProfile(user.id)

      return {
        id: user.id,
        email: user.email ?? '',
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role
      }
    } catch (error) {
      // Usa el mensaje específico de Supabase si está disponible
      const supabaseMessage = (error as errorResponse)?.message || (error as errorResponse)?.error_description || 'Error al iniciar sesión'

      let authError: AuthError = {
        type: 'login',
        message: supabaseMessage
      }

      switch (supabaseMessage) {
        case 'Email not confirmed':
          authError = {
            type: 'email_not_confirmed',
            message: 'Por favor, confirma tu correo electrónico antes de iniciar sesión.'
          }
          break
        case 'User not found':
          authError = {
            type: 'user_not_found',
            message: 'Usuario no encontrado. Por favor, verifica tu correo electrónico.'
          }
          break
        case 'Password is invalid':
          authError = {
            type: 'password_invalid',
            message: 'Contraseña incorrecta. Por favor, verifica tu contraseña.'
          }
          break
        case 'User is banned':
          authError = {
            type: 'user_banned',
            message: 'Tu cuenta ha sido desactivada.'
          }
          break
        case 'User is not active':
          authError = {
            type: 'user_not_active',
            message: 'Tu cuenta no está activa. Por favor, contacta al administrador.'
          }
          break
        case 'Invalid login credentials':
          authError = {
            type: 'login',
            message: 'Credenciales inválidas. Por favor, verifica tu correo electrónico y contraseña.'
          }
          break
        default:
          authError = {
            type: 'unknown',
            message: supabaseMessage
          }
      }

      return thunkAPI.rejectWithValue(authError)
    }
  }
)

// SIGNUP thunk
export const signUpUser = createAsyncThunk<
  User,
  { email: string; password: string; full_name: string; phone: string },
  {
    rejectValue: AuthError
  }
>(
  'auth/signUpUser',
  async ({ email, password, full_name, phone }, thunkAPI): Promise<User | ReturnType<typeof thunkAPI.rejectWithValue>> => {
    try {
      const { user } = await userService.signUp({
        email,
        password,
        metadata: { full_name, phone }
      })

      if (!user) throw new Error('No se pudo registrar el usuario')

      return {
        id: user.id,
        email: user.email ?? '',
        full_name,
        phone,
        role: 'staff'
      }
    } catch (error) {
      const supabaseMessage =
        (error as errorResponse)?.message || (error as errorResponse)?.error_description || 'Error al registrar usuario'

      const err: AuthError = {
        type: 'signup',
        message: supabaseMessage
      }

      return thunkAPI.rejectWithValue(err)
    }
  }
)

export const logoutUser = createAsyncThunk<void, AuthError | undefined>('auth/logoutUser', async (authError, thunkAPI) => {
  await userService.signOut()
  if (authError) {
    return thunkAPI.rejectWithValue(authError)
  }
})

export const restoreSession = createAsyncThunk<
  User,
  void,
  { rejectValue: string } // ✅ Tipo en caso de error
>('auth/restoreSession', async (_, thunkAPI) => {
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    const user = session?.user

    if (!user) return thunkAPI.rejectWithValue('No hay sesión activa')

    const profile = await userService.getUserProfile(user.id)

    return {
      id: user.id,
      email: user.email ?? '',
      full_name: profile.full_name,
      phone: profile.phone,
      role: profile.role
    }
  } catch (error) {
    const supabaseMessage = (error as errorResponse)?.message || (error as errorResponse)?.error_description || 'Error al iniciar sesión'

    return thunkAPI.rejectWithValue(supabaseMessage)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<User> & { id: string }>) => {
      const { id, email, phone, full_name, role } = action.payload
      state.isAuthenticated = true
      state.user = {
        id,
        email: email || '',
        phone: phone || '',
        full_name: full_name || '',
        role: role || 'staff'
      }
      state.authError = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        const { email, phone, full_name, role } = action.payload
        state.user.email = email || state.user.email
        state.user.phone = phone || state.user.phone
        state.user.full_name = full_name || state.user.full_name
        state.user.role = role || state.user.role
      }
      state.authError = null
    },
    clearUser: () => {
      return initialState
    },
    setAuthError: (state, action: PayloadAction<AuthError | null>) => {
      state.authError = action.payload
    },
    clearAuthError: (state) => {
      state.authError = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload as User
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.authError = action.payload ?? { type: 'login', message: 'Error desconocido' }
      })

      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true
        state.authError = null
      })
      .addCase(signUpUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.authError = action.payload ?? { type: 'login', message: 'Error desconocido' }
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.authError = (action.payload as AuthError) ?? { type: 'login', message: 'Error desconocido' }
      })

      .addCase(logoutUser.fulfilled, () => {
        return initialState
      })

      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload
        state.isLoading = false
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isAuthenticated = false
        state.user = initialState.user
        state.isLoading = false
      })
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true
      })
  }
})

export const { clearUser, setUser, clearAuthError, updateUser, setAuthError } = authSlice.actions
export default authSlice.reducer
