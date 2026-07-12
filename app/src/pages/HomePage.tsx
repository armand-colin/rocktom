import { useEffect } from 'react'
import { LevelList } from '../ui/levelList/LevelList'
import { LevelQueries } from '../queries/level/LevelQueries'
import { useMutation } from '../hooks/useMutation'
import { useNavigate } from 'react-router-dom'
import type { LevelEntity } from '../queries/level/LevelEntity'
import { Button, ButtonTheme } from '../ui/button/Button'
import { Instance } from '../Instance'
import { PopupManager } from '../resources/PopupManager'
import { CreateLevelPopup } from '../ui/createLevelPopup/CreateLevelPopup'
import { ProfileButton } from '../ui/profile/ProfileButton'
import './HomePage.scss'

export function HomePage() {
  const { isLoading: isLevelsLoading, data: levels, mutate: getAllLevels } = useMutation(LevelQueries.getAll)

  const navigate = useNavigate()

  useEffect(() => {
    getAllLevels()
  }, [])

  async function onSelectLevel(level: LevelEntity) {
    navigate('/app/level/' + level.id)
  }

  function onCreate() {
    Instance.engine.getResource(PopupManager).add(close => <CreateLevelPopup
      onSuccess={level => navigate('/editor/level/' + level.id)}
      close={close}
    />)
  }

  function onEdit(level: LevelEntity) {
    navigate('/editor/level/' + level.id)
  }

  return (
    <div
      className="HomePage"
      onContextMenu={e => e.preventDefault()}
    >
      <header className="HomePage-header">
        <h1 className="HomePage-title">Levels</h1>
        <div className="HomePage-actions">
          <ProfileButton />
          <Button
            theme={ButtonTheme.Primary}
            onClick={onCreate}
          >
            Create Level
          </Button>
        </div>
      </header>
      <main className="HomePage-content">
      {
        isLevelsLoading ?
          <div>Loading...</div> :
          levels && levels.ok ?
            <LevelList
              levels={levels.value}
              onSelect={onSelectLevel}
              onCreate={onCreate}
              onEdit={onEdit}
            /> :
            null
      }
      </main>
    </div>
  )
}
