import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'
import { userService } from '../../services/userService'

interface AuthUserPayload {
  id: string
  email: string
  phone: string
  full_name: string
  role: 'admin' | 'staff'
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUserPayload | null
  isLoading: boolean
  authError?: authError | null | undefined
}

interface authError {
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
export const loginUser = createAsyncThunk<AuthUserPayload, { email: string; password: string }, { rejectValue: authError }>(
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

      let authError: authError = {
        type: 'login',
        message: supabaseMessage
      }

      if (supabaseMessage === 'Invalid login credentials') {
        authError = { type: 'login', message: 'Credenciales inválidas. Por favor, verifica tu correo electrónico y contraseña.' }
      }

      return thunkAPI.rejectWithValue(authError)
    }
  }
)

// SIGNUP thunk
export const signUpUser = createAsyncThunk<
  AuthUserPayload,
  { email: string; password: string; full_name: string; phone: string },
  {
    rejectValue: authError
  }
>(
  'auth/signUpUser',
  async ({ email, password, full_name, phone }, thunkAPI): Promise<AuthUserPayload | ReturnType<typeof thunkAPI.rejectWithValue>> => {
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

      const err: authError = {
        type: 'signup',
        message: supabaseMessage
      }

      return thunkAPI.rejectWithValue(err)
    }
  }
)

// LOGOUT thunk
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await userService.signOut()
})

export const restoreSession = createAsyncThunk<
  AuthUserPayload,
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
    setUser: (state, action: PayloadAction<Partial<AuthUserPayload> & { id: string }>) => {
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
    clearUser: () => {
      return initialState
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
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthUserPayload>) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload as AuthUserPayload
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
      .addCase(signUpUser.fulfilled, (state, action: PayloadAction<AuthUserPayload>) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.authError = action.payload ?? { type: 'login', message: 'Error desconocido' }
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

export const { clearUser, setUser, clearAuthError } = authSlice.actions
export default authSlice.reducer
