import { saveAs } from 'file-saver'
import { getPictureVoByIdUsingGet } from '@/api/pictureController.ts'
import { getUserByIdUsingGet } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

/**
 * 下载图片
 * @param url 图片下载地址
 * @param fileName 要保存为的文件名
 */
export function downloadImage(url?: string, fileName?: string) {
  if (!url) {
    return
  }
  saveAs(url, fileName)
}

/**
 * 格式化文件大小
 * @param size
 */
export const formatSize = (size?: number) => {
  if (!size) return '未知'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 判断当前用户是否是图片的创建者或者管理员
 * @param pictureId 图片ID
 * @returns Promise<boolean> 是否有权限
 */
export const isPictureOwnerOrAdmin = async (pictureId: number): Promise<boolean> => {
  try {
    // 获取当前登录用户信息
    const loginUserStore = useLoginUserStore()
    // 确保获取到最新的用户信息
    await loginUserStore.fetchLoginUser()
    const currentUser = loginUserStore.loginUser

    // 如果是管理员，直接返回true
    if (currentUser.userRole === 'admin') {
      return true
    }

    // 获取图片详情
    const res = await getPictureVoByIdUsingGet({ id: pictureId })

    if (res.data.code === 0 && res.data.data) {
      const picture = res.data.data
      // 判断当前用户是否是图片创建者
      return picture.userId === currentUser.id
    }

    return false
  } catch (error) {
    console.error('判断用户权限时出错:', error)
    return false
  }
}

/**
 * 用户信息缓存
 */
const userCache = new Map<number, string>()

/**
 * 根据用户ID获取用户名
 * @param userId 用户ID
 * @returns Promise<string> 用户名
 */
export const getUsernameById = async (userId: number | undefined): Promise<string> => {
  // 检查用户ID是否存在
  if (!userId) {
    return 'N/A'
  }

  // 检查缓存中是否已存在用户名
  if (userCache.has(userId)) {
    return userCache.get(userId)!
  }

  try {
    // 调用API获取用户信息
    const res = await getUserByIdUsingGet({ id: userId })
    
    if (res.data.code === 0 && res.data.data) {
      const username = res.data.data.userName || `用户${userId}`
      // 将用户名存入缓存
      userCache.set(userId, username)
      return username
    } else {
      const unknownUser = `用户${userId}`
      userCache.set(userId, unknownUser)
      return unknownUser
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    const errorUser = `用户${userId}`
    userCache.set(userId, errorUser)
    return errorUser
  }
}