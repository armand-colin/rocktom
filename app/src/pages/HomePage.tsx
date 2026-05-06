import { useEffect } from 'react'
import { LevelList } from '../ui/levelList/LevelList'
import '../App.css'
import { LevelQueries } from '../queries/level/LevelQueries'
import { useMutation } from '../hooks/useMutation'
import { useNavigate } from 'react-router-dom'
import type { LevelEntity } from '../queries/level/LevelEntity'
import { Button } from '../ui/button/Button'
import { Instance } from '../Instance'
import { PopupManager } from '../resources/PopupManager'
import { CreateLevelPopup } from '../ui/createLevelPopup/CreateLevelPopup'

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
      className="App"
      onContextMenu={e => e.preventDefault()}
    >
      <h1>Levels</h1>
      <Button
        onClick={onCreate}
      >
        Create Level
      </Button>
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
    </div>
  )
}
