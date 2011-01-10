class AddContentToMaps < ActiveRecord::Migration
  def self.up
    add_column :maps, :content, :text
  end

  def self.down
    remove_column :maps, :content
  end
end
