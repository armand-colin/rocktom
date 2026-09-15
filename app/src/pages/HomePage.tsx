import { LevelList } from '../ui/level/levelList/LevelList'
import { LevelQueries } from '../queries/level/LevelQueries'
import { useNavigate } from 'react-router-dom'
import type { LevelEntity } from '../queries/level/LevelEntity'
import type { ImportedLevelTracks } from '../utils/levelImport'
import { Instance } from '../Instance'
import { PopupManager } from '../resources/PopupManager'
import { CreateLevelPopup } from '../ui/createLevelPopup/CreateLevelPopup'
import './HomePage.scss'
import { LiveInstrumentButton } from '../ui/liveInstrument/LiveInstrumentButton'
import { usePopupManager } from '../hooks/usePopupManager'
import { DeleteLevelPopup } from '../ui/level/DeleteLevelPopup'
import { LoadingPopup } from '../ui/loadingPopup/LoadingPopup'
import { LevelSharePopup } from '../ui/level/levelShare/LevelSharePopup'
import { useToastManager } from '../hooks/useToastManager'
import { Toast } from '../ui/toast/Toast'
import { UserQueries } from '../queries/user/UserQueries'
import { Page } from '../ui/page/Page'
import { useQuery } from '../hooks/useQuery'
import { Body } from '../resources/queryClient/Body'

export function HomePage() {
  const { isLoading: isLevelsLoading, result: levels, refresh: refreshLevels } = useQuery(LevelQueries.getAll, { arguments: {} })
  const { result: userInfoResult } = useQuery(UserQueries.me, { arguments: {} })

  const popupManager = usePopupManager()
  const toastManager = useToastManager()
  const navigate = useNavigate()

  const userId = userInfoResult?.ok ?
    userInfoResult.value.id :
    null

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

  function onRemove(level: LevelEntity) {
    popupManager.add(close => <DeleteLevelPopup
      close={close}
      level={level}
      onSuccess={() => {
        refreshLevels()
      }}
    />)
  }

  async function onShare(level: LevelEntity) {
    if (level.share) {
      const share = level.share
      popupManager.add(close => <LevelSharePopup
        close={close}
        level={level}
        share={share}
      />)
      return
    }

    const loading = popupManager.add(() => <LoadingPopup />)

    const result = await LevelQueries.share.run({ path: { id: level.id } })

    if (result.ok) {
      popupManager.add(close => <LevelSharePopup
        close={close}
        level={level}
        share={result.value}
      />)
    } else {
      toastManager.add(close => <Toast.Simple
        message={'Failed to share level (' + result.error.message + ')'}
        close={close}
      />)
    }

    loading.close()
  }

  async function onImport(level: LevelEntity, imported: ImportedLevelTracks) {
    const result = await LevelQueries.update.run({
      path: { id: level.id },
      body: Body.json({
        name: level.name,
        serialized: imported.serialized,
        duration: imported.duration,
        playbackId: imported.playbackId,
        instrumentTypes: imported.instrumentTypes,
      }),
    })

    if(!result.ok) {
        throw result.error
      }

    refreshLevels()
  }

  return (
    <Page
      className="HomePage"
    >
      <Page.ConnectedTitle
        title="Levels"
        beforeActions={<>
          <LiveInstrumentButton />
        </>}
      />

      <Page.Content>
        {
          isLevelsLoading ?
            <div>Loading...</div> :
            levels && levels.ok ?
              <LevelList
                levels={levels.value}
                onSelect={onSelectLevel}
                onCreate={onCreate}
                onEdit={onEdit}
                onRemove={onRemove}
                onImport={onImport}
                onShare={onShare}
                userId={userId}
              /> :
              null
        }
      </Page.Content>
    </Page>
  )
}
