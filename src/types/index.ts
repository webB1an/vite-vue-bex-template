export interface BookmarkTreeNode {
  /** Optional. The 0-based position of this node within its parent folder.  */
  index?: number | undefined
  /** Optional. When this node was created, in milliseconds since the epoch (new Date(dateAdded)).  */
  dateAdded?: number | undefined
  /** The text displayed for the node. */
  title: string
  /** Optional. The URL navigated to when a user clicks the bookmark. Omitted for folders.   */
  url?: string | undefined
  /** Optional. When the contents of this folder last changed, in milliseconds since the epoch.   */
  dateGroupModified?: number | undefined
  /** The unique identifier for the node. IDs are unique within the current profile, and they remain valid even after the browser is restarted.  */
  id: string
  /** Optional. The id of the parent folder. Omitted for the root node.   */
  parentId?: string | undefined
  /** Optional. An ordered list of children of this node.  */
  children?: BookmarkTreeNode[] | undefined
  /**
         * Optional.
         * Since Chrome 37.
         * Indicates the reason why this node is unmodifiable. The managed value indicates that this node was configured by the system administrator or by the custodian of a supervised user. Omitted if the node can be modified by the user and the extension (default).
         */
  unmodifiable?: 'managed' | undefined
}
